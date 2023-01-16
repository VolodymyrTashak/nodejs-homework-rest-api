function validateBody(schema) {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            res.status(404).json({ message: "Missing required  field" });
        }
        return next();
    }
};

module.exports = {
    validateBody,
}