// COnverting dollar to cents when saving
export function convertToCents(amount:number){
    return Math.round(amount *100);
}

export function convertToDollarsUnit(amount:number){
    return amount/100;

}