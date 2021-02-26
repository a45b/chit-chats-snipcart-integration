import { NextApiRequest, NextApiResponse } from 'next';
import waait from 'waait';
import { Content } from '../../../interfaces/chitchat';
import { buyShipment, getShipment } from '../../../utils/chitchats';
import { updateOrder } from '../../../utils/snipCartAPI';

interface SnipCartWebhookBody {
  eventName: string;
  content: Content;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  console.group('Webhook Request');
  // Todo: Auth Snipcart webhook with X-Snipcart-RequestToken Header
  // https://app.snipcart.com/api/requestvalidation/{token}

  const body = req.body as SnipCartWebhookBody;
  console.log(`Incoming Webhook: ${body.eventName}`);
  // console.log(req);
  if (body.eventName === 'order.completed') {
    // Right now we're just getting quotes. buying shipment once we are ready to ship
    return res.status(200).json({ nothing: 'Not currently Buying Shipment' });
    console.log('buying Shipment!');
    const { content } = body;
    const [
      shippingId,
      shippingMethod,
    ] = content.shippingRateUserDefinedId.split(' --- ');

    const shipmentResponse = await buyShipment(shippingId, shippingMethod);
    console.dir(shipmentResponse, { depth: null });
    console.log('Now waiting 3 seconds...');
    // Wait ~3 seconds
    await waait(3000);
    // Fetch the shipment Info
    console.log('fetching shipment');
    const { data } = await getShipment(shippingId);
    const shipment = data?.shipment;
    console.log('Updating Shipment data in Snipcart');
    const updatedOrder = await updateOrder(body.content.token, {
      trackingNumber: shipment?.carrier_tracking_code,
      trackingUrl: shipment?.tracking_url,
      // don't mark as shipped just yet
      // status: 'Shipped',
      metadata: {
        label: shipment?.postage_label_png_url,
        labelZpl: shipment?.postage_label_zpl_url,
        chitChatId: shippingId,
      },
    });
    console.log('Done!', updatedOrder);

    console.groupEnd();
    return res.status(200).json(updatedOrder);
  }
  return res.status(200).json({ nothing: 'To send here ' });
}
// 1. Buy the shipment while updating postage_type to be that of the order
// 2. Wait 3 seconds? Maybe
// 3. Check
