export default class Maybe<T> {
    private value: T;
    constructor (value: T) {
        this.value = value;
    }
    public getValue() {
        return this.value;
    }
    public bind<Type>(func: (value: T) => Type) {
        let newVal: Type = func(this.value);
        return new Maybe<Type>(newVal);
    }   
}