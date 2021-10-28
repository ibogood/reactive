const Dep = { target: null }
const state = (value) => {
    const deps = []
    const obj = {
        __state__: true,
        value
    }
    return new Proxy(obj, {
        get(target, key) {
            if (key === 'deps') {
               return deps
            }
            if (key === 'value' && Dep.target) {
                deps.push(Dep.target)
                Dep.target = null
            }
            return target[key]
        },
        set(target, key, value) {
            const oldValue = obj.value
            target[key] = value
            deps.forEach((dep) => {
                dep(value, oldValue)
            })
            return true
        }
    })
}
const listen = (value, cb) => {
    if (Array.isArray(value)) {
        return value.forEach(v => {
            v.deps.push(cb)
        })
    }
    return value.deps.push(cb)
}
const calc = (cb, deps) => {
    if (!deps) {
        Dep.target = () => {
          value.value = cb()
        }
    }
    const value = state(cb())
    if (deps) {
        listen(deps, () => {
            value.value = cb()
        })
    }
    return value
}


const foo = state(1)
listen(foo, (value, oldValue) => {
    console.log('foo change', value, oldValue)
})
const bar = calc(() => {
  return foo.value  + 2
})
const baz = calc(() => {
    return bar.value + 3
})
foo.value = 22
setTimeout(() => {
    console.log('bar', bar.value)
    console.log('baz', baz.value)
})
