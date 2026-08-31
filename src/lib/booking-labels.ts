export const STATUS_LABEL: Record<string, string> = {
  REQUESTED: "New request",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EN_ROUTE: "On the way",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const RECRUITER_STATUS_LABEL: Record<string, string> = {
  REQUESTED: "Waiting for worker",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EN_ROUTE: "On the way",
  ARRIVED: "Arrived",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_COLOR: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  EN_ROUTE: "bg-blue-100 text-blue-700",
  ARRIVED: "bg-purple-100 text-purple-700",
  COMPLETED: "bg-green-100 text-green-700",
  DECLINED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-gray-100 text-gray-500",
};
