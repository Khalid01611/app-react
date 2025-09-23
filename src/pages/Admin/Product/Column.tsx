import { SquarePen } from "lucide-react";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import Button from "../../../components/ui/Button";
import Toggle from "../../../components/ui/Toggle";
import { usePermission } from "../../../hooks/usePermission";
import type { Column, RootState } from "../../../interface/types";

interface Product {
  _id: string;
  name: string;
  purchases: number;
  sell: number;
  description?: string | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
  onStatusToggle,
}: {
  onView: (row: Product) => void;
  onEdit: (row: Product) => void;
  onDelete: (row: Product) => void;
  onStatusToggle: (productId: string, status: boolean) => void;
}): Column<Product>[] => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { canView, canUpdate, canDelete } = usePermission(user, "product");

  return [
  {
    header: "Product Name",
    accessor: "name",
    cell: (row) => (
      <div className="font-medium">
        {row.name}
      </div>
    ),
  },
  {
    header: "Purchase Price",
    accessor: "purchases",
    cell: (row) => (
      <div className="text-sm">
        ৳{row.purchases.toFixed(2)}
      </div>
    ),
  },
  {
    header: "Sell Price",
    accessor: "sell",
    cell: (row) => (
      <div className="text-sm">
        ৳{row.sell.toFixed(2)}
      </div>
    ),
  },
  {
    header: "Description",
    accessor: "description",
    cell: (row) => (
      <div className="text-sm max-w-xs truncate">
        {row.description || "No description"}
      </div>
    ),
  },
  {
    header: "Status",
    accessor: "status",
    cell: (row) => (
      <div className="flex items-center">
        <Toggle
          id={`status-${row._id}`}
          checked={row.status}
          onChange={(e) => onStatusToggle(row._id, e.target.checked)}
          aria-label={`Toggle status for ${row.name}`}
        />
        <span className="ml-2 text-xs font-medium capitalize">
          {row.status ? "Active" : "Inactive"}
        </span>
      </div>
    ),
  },
  {
    header: "Created",
    accessor: "createdAt",
    cell: (row) => (
      <div className="text-sm">
        {new Date(row.createdAt).toLocaleDateString()}
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
