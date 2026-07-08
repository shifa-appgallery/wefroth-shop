import { Client, Environment } from "square-legacy";
import { randomUUID } from "crypto";

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment:
    process.env.SQUARE_ENVIRONMENT === "production"
      ? Environment.Production
      : Environment.Sandbox,
});
export const createPayment = async (
  sourceId: string,
  amount: number,
  currency = "AUD"
) => {
  try {

    const response = await client.paymentsApi.createPayment({
      sourceId,
      idempotencyKey: randomUUID(),
      locationId: process.env.SQUARE_LOCATION_ID!,
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)),
        currency,
      },
    });
    return response.result;
  } catch (error: any) {
    console.error("=========== SQUARE ERROR ===========");
    console.dir(error, { depth: null });

    console.log("Body:", error.body);
    console.log("Result:", error.result);
    console.log("Errors:", error.errors);

    throw error;
  }
};

export const getPayment = async (
  paymentId: string
) => {

  const response =
    await client.paymentsApi.getPayment(
      paymentId
    );

  return response.result;
};

export const refundPayment = async (
  paymentId: string,
  amount: number,
  currency = "AUD"
) => {
  try {
    const response = await client.refundsApi.refundPayment({
      paymentId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)),
        currency,
      },
    });

    return response.result;
  } catch (error: any) {
    console.error("=========== SQUARE REFUND ERROR ===========");
    console.dir(error, { depth: null });

    console.log("Body:", error.body);
    console.log("Result:", error.result);
    console.log("Errors:", error.errors);

    throw error;
  }
};