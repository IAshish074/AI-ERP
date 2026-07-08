module.exports = {
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },
  ORDER_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  INVOICE_STATUS: {
    UNPAID: 'unpaid',
    PARTIALLY_PAID: 'partially_paid',
    PAID: 'paid',
    OVERDUE: 'overdue'
  }
};
