const setUpdatedFields = (entity, fields) => {
    Object.keys(fields).forEach(key => {
        if(fields[key] !== undefined){
            entity[key] = fields[key];
        }
    });
}

module.exports = setUpdatedFields;
