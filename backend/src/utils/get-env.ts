const getEnv = (key:string, defaultValue?:string):string => {

    const value = process.env[key];

    if(value === undefined){
        if(defaultValue === undefined){
            throw new Error(`Enviornment variable ${key}: not set`)
        }
        return defaultValue;
    }
    return value;
};