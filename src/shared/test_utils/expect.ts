import { expect } from 'chai'
import { Any } from '../../types'
class Expect {
    obj: Any
    constructor(obj: Any) {
        this.obj = obj
    }

    toBe(expected: Any) {
        expect(this.obj).to.equal(expected)
    }

    toNotBe(expected: Any) {
        expect(this.obj).to.not.equal(expected)
    }
    
    toBeTruthy() {
        expect(this.obj).to.be.ok
    }
    
    toBeFalsy() {
        expect(this.obj).to.not.be.ok
    }
    
    toBeNull() {
        expect(this.obj).to.be.null
    }
    
    toBeUndefined() {
        expect(this.obj).to.be.undefined
    }

    toHaveProperty(property: string) {
        expect(this.obj).to.have.property(property)
    }
    
    toBeGreaterThan(expected: number) {
        expect(this.obj).to.be.greaterThan(expected)
    }
    
    toBeLessThan(expected: number) {
        expect(this.obj).to.be.lessThan(expected)
    }

    toBeGreaterThanOrEqualTo(expected: number) {
        expect(this.obj).to.be.greaterThanOrEqual(expected)
    }
    
    toBeLessThanOrEqualTo(expected: number) {
        expect(this.obj).to.be.lessThanOrEqual(expected)
    }
    
    toContain(expected: Any) {
        expect(this.obj).to.contain(expected)
    }
    
    toHaveLength(expected: number) {
        expect(this.obj).to.have.length(expected)
    }

    toDeepEqual(expected: Any) {
        expect(this.obj).to.deep.equal(expected)
    }
}

export default (obj: Any) => {
    return new Expect(obj)
}
