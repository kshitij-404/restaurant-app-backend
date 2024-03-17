import cron from "@elysiajs/cron";
import OrderModel from "../models/orderModel";
import ky from "ky";

const cancelTxnCron = cron({
    name: 'cancel transaction',
    pattern: '*/1 * * * *',
    run() {
        (async function () {
            try {
                const pendingPaymentOrders = await OrderModel.find({
                    paymentStatus: 'pending',
                    placedAt: { $lt: new Date(new Date().getTime() - 5 * 60 * 1000) }
                }).exec();
                await Promise.all(pendingPaymentOrders.map(async (o) => {
                    try {
                        const urlParts = o.paymentMetadata.data.payment_url.split("/")
                        const paymentId = urlParts[urlParts.length - 1]
                        await ky.get(`https://qrstuff.me/gateway/cancel_txn/${paymentId}`)
                        await o.save();
                    }
                    catch (error) {
                        console.log(error)
                    }
                })
                )
            } catch (error) {
                console.log(error)
            }
        })()
    }
})

export default cancelTxnCron;