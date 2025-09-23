import { SquarePen } from "lucide-react";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import Button from "../../../components/ui/Button";
import { usePermission } from "../../../hooks/usePermission";
import type { Column, RootState } from "../../../interface/types";

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
  createdAt: string;
  updatedAt: string;
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView: (row: Invoice) => void;
  onEdit: (row: Invoice) => void;
  onDelete: (row: Invoice) => void;
}): Column<Invoice>[] => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { canView, canUpdate, canDelete } = usePermission(user, "invoice");

  return [
    {
      header: "Invoice No",
      accessor: "invoice_no",
      cell: (row) => (
        <div className="font-medium">
          {row.invoice_no}
        </div>
      ),
    },
    {
      header: "Date",
      accessor: "date_time",
      cell: (row) => (
        <div className="text-sm">
          {new Date(row.date_time).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Vehicle No",
      accessor: "vehicle_no",
      cell: (row) => (
        <div className="text-sm">
          {row.vehicle_no || "-"}
        </div>
      ),
    },
    {
      header: "Customer",
      accessor: "customer_name",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.customer_name}</div>
          <div className="text-sm">{row.customer_phone_number}</div>
        </div>
      ),
    },
    {
      header: "Product",
      accessor: "product",
      cell: (row) => (
        <div className="text-sm">
          {row.product.name}
        </div>
      ),
    },
    {
      header: "Seller",
      accessor: "seller",
      cell: (row) => (
        <div className="font-medium">
          {row.seller.name}
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: "total_amount",
      cell: (row) => (
        <div className="text-right">
          <div className="font-medium">
            ৳{row.total_amount.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      header: "Payment",
      accessor: "payment_method",
      cell: (row) => (
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${row.payment_method === 'cash'
              ? 'bg-green-100 dark:bg-green-900'
              : row.payment_method === 'credit' || row.payment_method === 'due'
                ? 'bg-yellow-100 dark:bg-yellow-900'
                : 'bg-blue-100 dark:bg-blue-900'
            }`}>
            {row.payment_method}
          </span>
        </div>
      ),
    },
    {
      header: "SMS",
      accessor: "is_sent_sms",
      cell: (row) => (
        <div className="flex items-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${row.is_sent_sms === true
              ? 'bg-green-100 dark:bg-green-900'
              : 'bg-yellow-100 dark:bg-yellow-900'
            }`}>
            {row.is_sent_sms === true ? "Sent" : "Not Sent"}
          </span>
        </div>
      ),
    },
    {
      header: "",
      cell: (row) => (
        <div className="flex justify-end space-x-2">
          {canView && (
            <Button variant="view" onClick={() => onView(row)} aria-label="View">
              <FiEye size={14} />
            </Button>
          )}
          {canUpdate && (
            <Button variant="edit" onClick={() => onEdit(row)} aria-label="Edit">
              <SquarePen size={15} />
            </Button>
          )}
          {canDelete && (
            <Button variant="delete" onClick={() => onDelete(row)} aria-label="Delete">
              <FiTrash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];
};
