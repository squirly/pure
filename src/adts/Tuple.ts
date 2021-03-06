import { Show } from '../typeclasses/Show'
import { Setoid } from '../typeclasses/Setoid'
import { Ord } from '../typeclasses/Ord'
import { Semigroup } from '../typeclasses/Semigroup'
import { Bifunctor } from '../typeclasses/Bifunctor'
import { Functor } from '../typeclasses/Functor'
import { Apply } from '../typeclasses/Apply'
import concat from '../utils/concat'

export interface Tuple<F, S> extends Tuple_<F, S> {}

export interface ITuple {
    <F, S>(fst: F, snd: S): Tuple<F, S>
    fanout: typeof Tuple_.fanout,
    fromArray: typeof Tuple_.fromArray
}

export class Tuple_<F, S> implements Show, Setoid<Tuple<F, S>>, Ord<Tuple<F, S>>, Semigroup<Tuple<F, S>>, Bifunctor<F, S>, Functor<S>, Apply<S> {
    constructor(private readonly first: F, private readonly second: S) {}

    readonly 'fantasy-land/equals' = this.equals
    readonly 'fantasy-land/lte' = this.lte
    readonly 'fantasy-land/concat' = this.concat
    readonly 'fantasy-land/bimap' = this.bimap
    readonly 'fantasy-land/map' = this.map
    readonly 'fantasy-land/ap' = this.ap

    /** Applies two functions over a single value and constructs a tuple from the results */
    static fanout<F, S, T>(f: (value: T) => F, g: (value: T) => S): (value: T) => Tuple<F, S>
    static fanout<F, S, T>(f: (value: T) => F, g: (value: T) => S, value: T): Tuple<F, S>
    static fanout<F, S, T>(f: (value: T) => F, g: (value: T) => S, value?: T) : any {
        if (value !== undefined) {
            return Tuple(f(value), g(value))
        }

        return (value: T): Tuple<F, S> => Tuple(f(value), g(value))
    }

    /** Constructs a tuple from an array with two elements */
    static fromArray<F, S>([fst, snd]: [F, S]): Tuple<F, S> {
        return Tuple(fst, snd)
    }

    toJSON(): [F, S] {
        return this.toArray()
    }

    inspect(): string {
        return this.toArray().toString()
    }

    toString(): string {
        return this.inspect()
    }

    /** Returns the first value of `this` */
    fst(): F {
        return this.first
    }

    /** Returns the second value of `this` */
    snd(): S {
        return this.second
    }

    /** Compares the values inside `this` and another tuple */
    equals(other: Tuple<F, S>): boolean {
        return this.first === other.first && this.second === other.second
    }

    /** Returns true if both values inside `this` are less than or equal to the values inside anotther tuple, otherwise returns false */
    lte(other: Tuple<F, S>): boolean {
        return this.first <= other.first && this.second <= other.second
    }

    /** Transforms the two values inside `this` with two mapper functions */
    bimap<F2, S2>(f: (fst: F) => F2, g: (snd: S) => S2): Tuple<F2, S2> {
        return Tuple(f(this.first), g(this.second))
    }

    /** Applies a function to the first value of `this` */
    mapFirst<F2>(f: (fst: F) => F2): Tuple<F2, S> {
        return Tuple(f(this.first), this.second)
    }

    /** Applies a function to the second value of `this` */
    map<S2>(f: (snd: S) => S2): Tuple<F, S2> {
        return Tuple(this.first, f(this.second))
    }

    /** Returns an array with 2 elements - the values inside `this` */
    toArray(): [F, S] {
        return [this.first, this.second]
    }

    /** Swaps the values inside `this` */
    swap(): Tuple<S, F> {
        return Tuple(this.second, this.first)
    }

    /** Concatinates the first and second values of `this` and another tuple */
    concat(other: Tuple<F, S>): Tuple<F, S> {
        return Tuple(concat(this.first, other.first), concat(this.second, other.second))
    }

    /** Applies the second value of a tuple to the second value of `this` */
    ap<T, S2>(f: Tuple<T, (value: S) => S2>): Tuple<F, S2> {
        return Tuple(this.first, f.second(this.second))
    }
}

const TupleConstructor = <F, S>(fst: F, snd: S): Tuple<F, S> =>
    new Tuple_(fst, snd)

export const Tuple: ITuple = Object.assign(TupleConstructor, {fanout: Tuple_.fanout, fromArray: Tuple_.fromArray})