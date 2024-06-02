import prismadb from "@/lib/prismadb";
import { OrderForm } from "./components/order-form";

const OrderPage = async ({ params }: { params: { order_id: string } }) => {
  const orderStates = await prismadb.orderState.findMany({
    orderBy: {
      order_state_id: "asc",
    },
  });
  const order = await prismadb.order.findUnique({
    where: {
      order_id: params.order_id,
    },
    include: {
      orderItems: {
        include: {
          product: {
            include:{
              category: true,
              color: true,
              size: true,
            }
          },
        },
      },
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderForm data={order!} states={orderStates}/>
      </div>
    </div>
  );
};

export default OrderPage;
