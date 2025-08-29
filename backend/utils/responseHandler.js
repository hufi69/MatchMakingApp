// responseHandler.js
class ResponseHandler {
	static send(res, statusCode, payload = {}) {
	  res.status(statusCode).json(payload);
	}
  
	static badRequest(res, message = "Bad Request") {
	  this.send(res, 400, { success: false, message });
	}
  
	static unauthorized(res, message = "Unauthorized") {
	  this.send(res, 401, { success: false, message });
	}
  
	// ... existing code ...
	static ok(res, data, message = "Success") {
	// Check if data is a string and treat it as a message
	if (typeof data === 'string') {
	  this.send(res, 200, { success: true, message: data });
	} else {
	  // Put fields directly on the root; include success/message
	  this.send(res, 200, { success: true, message, ...data });
	}
  }
  // ... existing code ...
  
	static notFound(res, message = "Not Found") {
	  this.send(res, 404, { success: false, message });
	}
  
	static serverError(res, message = "Internal Server Error") {
	  this.send(res, 500, { success: false, message });
	}
  }
  module.exports = { ResponseHandler };
  