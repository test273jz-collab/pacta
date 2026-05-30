const Contact = require("../models/contact.model");
const { sendSuccess } = require("../utils/apiResponse");
const { getPaginationMeta } = require("../utils/pagination");
const AppError = require("../utils/AppError");

// ==================== SUBMIT CONTACT FORM (Public) ====================
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return next(new AppError("All fields (name, email, subject, message) are required", 400));
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      user: req.user?._id || null,
    });

    sendSuccess(res, 201, "Message sent successfully. We will get back to you soon.", contact);
  } catch (error) {
    next(error);
  }
};

// ==================== GET ALL MESSAGES (Admin) ====================
exports.getAllMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const [messages, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Contact.countDocuments(filter),
    ]);

    sendSuccess(res, 200, "Messages retrieved", messages, getPaginationMeta(parseInt(page), parseInt(limit), total));
  } catch (error) {
    next(error);
  }
};

// ==================== GET SINGLE MESSAGE (Admin) ====================
exports.getMessageById = async (req, res, next) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) return next(new AppError("Message not found", 404));

    // Auto-mark as read when viewed
    if (message.status === "new") {
      message.status = "read";
      await message.save();
    }

    sendSuccess(res, 200, "Message retrieved", message);
  } catch (error) {
    next(error);
  }
};

// ==================== REPLY TO MESSAGE (Admin) ====================
exports.replyToMessage = async (req, res, next) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage?.trim()) {
      return next(new AppError("Reply message is required", 400));
    }

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      {
        status: "replied",
        replyMessage: replyMessage.trim(),
        repliedAt: new Date(),
      },
      { new: true }
    );

    if (!message) return next(new AppError("Message not found", 404));

    sendSuccess(res, 200, "Reply sent successfully", message);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE MESSAGE (Admin) ====================
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) return next(new AppError("Message not found", 404));

    sendSuccess(res, 200, "Message deleted");
  } catch (error) {
    next(error);
  }
};
