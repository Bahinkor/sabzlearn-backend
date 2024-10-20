const {isValidObjectId} = require("mongoose");
const discountModel = require("./../discount/Discount.model");
const discountValidator = require("./../discount/discount.validator");
const courseModel = require("./../course/Course.model");

exports.getAll = async (req, res) => {
    try {
        const discounts = await discountModel.find({}, "-__v")
            .populate("course", "title href").populate("creator", "name").lean();

        return res.json(discounts);

    } catch (err) {
        console.log(`discount controller, get all error => ${err}`);
        return res.status(500).json(err);
    }
};

exports.create = async (req, res) => {
    try {
        const {_id: userID} = req.user;

        const validationResult = discountValidator(req.body);
        if (validationResult !== true) return res.status(422).json(validationResult);

        const {code, max, percent, course: courseID} = req.body;

        const isValidCourseID = isValidObjectId(courseID);
        if (!isValidCourseID) return res.status(422).json({message: "Invalid Course"});

        const course = await courseModel.findOne({_id: courseID});
        if (!course) return res.status(404).json({message: "Course not found"});

        await discountModel.create({
            code,
            percent,
            max,
            course: courseID,
            creator: userID,
        });

        return res.status(201).json({
            message: "discount created successfully"
        });

    } catch (err) {
        console.log(`discount controller, create error => ${err}`);
        return res.status(500).json(err);
    }
};

exports.setOneAll = async (req, res) => {
    try {
        const {discount} = req.body;

        if (typeof discount !== "number" || discount < 1 || discount > 100) return res.status(422).json({message: "discount not valid"});

        await courseModel.updateMany({}, {
            discount,
        });

        return res.json({
            message: "set all discount successfully",
        });

    } catch (err) {
        console.log(`discount controller, set one all error => ${err}`);
        return res.status(500).json(err);
    }
};

exports.getOne = async (req, res) => {
    try {
        const {code, course} = req.body;

        const isValidCourseID = isValidObjectId(course);
        if (!isValidCourseID) return res.status(422).json({message: "course id is not valid"});

        const discount = await discountModel.findOne({
            code,
            course,
        });
        if (!discount) return res.status(404).json({message: "discount not found"});

        if (discount.user >= discount.max) return res.status(409).json({message: "The discount has expired"});

        await discountModel.findOneAndUpdate({
            _id: discount._id
        }, {
            user: discount.user + 1,
        });

        return res.json(discount);

    } catch (err) {
        console.log(`discount controller, getOne err => ${err}`);
        return res.status(500).json(err);
    }
};

exports.remove = async (req, res) => {
    try {
        const {id} = req.params;

        const isValidDiscountID = isValidObjectId(id);
        if (!isValidDiscountID) return res.status(422).json({message: "invalid discountID"});

        const deletedDiscount = await discountModel.findOneAndDelete({_id: id});
        if (!deletedDiscount) return res.status(404).json({message: "discount not found"});

        return res.json({
            message: "discount deleted successfully",
        });

    } catch (err) {
        console.log(`discount controller, remove err => ${err}`);
        return res.status(500).json(err);
    }
};