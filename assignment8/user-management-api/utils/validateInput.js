// utils/validateInput.js
// Blocks query-operator injection such as {"email": {"$ne": ""}} by requiring the named
// inputs to be plain strings. A field that is missing is left to each route's own
// "required" check; a field that is present but is an object, array, number, etc. is rejected.

function nonStringFields(source, names) {
    const data = source || {};
    return names.filter((name) => data[name] !== undefined && typeof data[name] !== 'string');
}

// Sends a 400 and returns true if any named field is not a plain string.
// Never echoes the submitted values.
function rejectNonStringInput(res, source, names) {
    const bad = nonStringFields(source, names);
    if (bad.length === 0) return false;
    res.status(400).json({
        error: `Invalid input. ${bad.join(', ')} must be plain text.`
    });
    return true;
}

module.exports = { nonStringFields, rejectNonStringInput };
