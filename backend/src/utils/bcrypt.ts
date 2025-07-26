import bcrypt from "bcrypt";

// We always want to hash our password
export const hashValue = async(value:string, salRounds:number=10) => {
     return await bcrypt.hash(value,salRounds);
}

//Compare our plain password with the hashed password stored in our DB.
export const compareValue = async(value:string,hashedValue:string) => {
    return await bcrypt.compare(value,hashedValue);
}