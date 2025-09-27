import type { Column } from "../../../interface/types";

interface Product {
  _id: string;
  name: string;
  purchases: number;
  sell: number;
}

interface Seller {
  _id: string;
  name: string;
  email: string;
}

interface Invoice {
  _id: string;
  invoice_no: string;
  date_time: string;
  vehicle_no?: string | null;
  customer_name: string;
  customer_phone_number: string;
  payment_method: "cash" | "card" | "bank_transfer" | "credit" | "due";
  product: Product;
  seller: Seller;
  price: number;
  quantity: number;
  total_amount: number;
  discount: number;
  is_sent_sms: boolean;
  profit?: number;
  profitMargin?: number;
  calculatedTotal?: number;
  createdAt: string;
  updatedAt: string;
}

export const getColumns = (): Column<Invoice>[] => [
  {
    header: "Invoice No",
    accessor: "invoice_no",
    cell: (row: Invoice) => {
      if (!row || typeof row !== 'object') return "N/A";
      if (!row.invoice_no) return "N/A";
      return (
        <span className="font-medium">{row.invoice_no}</span>
      );
    },
  },
  {
    header: "Date",
    accessor: "date_time",
    cell: (row: Invoice) => {
      if (!row || typeof row !== 'object') return "N/A";
      if (!row.date_time) return "N/A";
      return (
        <span>
          {new Date(row.date_time).toLocaleDateString()}
        </span>
      );
    },
  },
  {
    header: "Customer",
    accessor: "customer_name",
    cell: (row: Invoice) => {
      if (!row) return "N/A";
      return (
        <div>
          <div className="font-medium">{row.customer_name || 'N/A'}</div>
          <div className="text-sm">{row.customer_phone_number || 'N/A'}</div>
        </div>
      );
    },
  },
  {
    header: "Product",
    accessor: (row: Invoice) => row?.product?.name || "N/A",
    cell: (row: Invoice) => {
      if (!row?.product?.name) return "N/A";
      return (
        <span>{row.product.name}</span>
      );
    },
  },
  {
    header: "Seller",
    accessor: (row: Invoice) => row?.seller?.name || "N/A",
    cell: (row: Invoice) => {
      if (!row?.seller?.name) return "N/A";
      return (
        <div>
          <div className="font-medium">{row.seller.name}</div>
          <div className="text-sm">{row.seller.email}</div>
        </div>
      );
    },
  },
  {
    header: "Amount",
    accessor: "total_amount",
    cell: (row: Invoice) => {
      if (!row?.total_amount) return "N/A";
      return (
        <span className="font-semibold">
          ৳{row.total_amount.toFixed(2)}
        </span>
      );
    },
  },
  {
    header: "Payment",
    accessor: "payment_method",
    cell: (row: Invoice) => {
      if (!row?.payment_method) return "N/A";
      return (
        <span className="capitalize">{row.payment_method}</span>
      );
    },
  },
];
