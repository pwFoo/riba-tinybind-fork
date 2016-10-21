import {parseType} from './parsers'
import Observer from './observer'

function getInputValue(el) {
  let results = []
  if (el.type === 'checkbox') {
    return el.checked
  } else if (el.type === 'select-multiple') {

    el.options.forEach(option => {
      if (option.selected) {
        results.push(option.value)
      }
    })

    return results
  } else {
    return el.value
  }
}

// A single binding between a model attribute and a DOM element.
export class Binding {
  // All information about the binding is passed into the constructor; the
  // containing view, the DOM node, the type of binding, the model object and the
  // keypath at which to listen for changes.
  constructor(view, el, type, keypath, binder, arg, options) {
    this.view = view
    this.el = el
    this.type = type
    this.keypath = keypath
    this.options = options
    this.dependencies = []
    this.formatterObservers = {}
    this.model = undefined
    this.binder = binder
    this.arg = arg
  }

  // Observes the object keypath
  observe(obj, keypath) {
    return new Observer(obj, keypath, this)
  }

  parseTarget() {
    if (this.keypath) {
      let token = parseType(this.keypath)

      if (token.type === 0) {
        this.value = token.value
      } else {
        this.observer = this.observe(this.view.models, this.keypath)
        this.model = this.observer.target
      }
    } else {
      this.value = undefined;
    }
  }

  parseFormatterArguments(args, formatterIndex) {
    return args
      .map(parseType)
      .map(({type, value}, ai) => {
        if (type === 0) {
          return value
        } else {
          if (!this.formatterObservers[formatterIndex]) {
            this.formatterObservers[formatterIndex] = {}
          }

          let observer = this.formatterObservers[formatterIndex][ai]

          if (!observer) {
            observer = this.observe(this.view.models, value)
            this.formatterObservers[formatterIndex][ai] = observer
          }

          return observer.value()
        }
      })
  }

  // Applies all the current formatters to the supplied value and returns the
  // formatted value.
  formattedValue(value) {
    this.options.formatters.forEach((formatterStr, fi) => {
      let args = formatterStr.match(/[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g)
      let id = args.shift()
      let formatter = this.view.options.formatters[id]

      const processedArgs = this.parseFormatterArguments(args, fi)

      if (formatter && (formatter.read instanceof Function)) {
        value = formatter.read(value, ...processedArgs)
      } else if (formatter instanceof Function) {
        value = formatter(value, ...processedArgs)
      }
    })

    return value
  }

  // Returns an event handler for the binding around the supplied function.
  eventHandler(fn) {
    let binding = this
    let handler = binding.view.options.handler

    return function(ev) {
      handler.call(fn, this, ev, binding)
    }
  }

  // Sets the value for the binding. This Basically just runs the binding routine
  // with the supplied value formatted.
  set(value) {
    if ((value instanceof Function) && !this.binder.function) {
      value = this.formattedValue(value.call(this.model))
    } else {
      value = this.formattedValue(value)
    }

    let routineFn = this.binder.routine || this.binder

    if (routineFn instanceof Function) {
      routineFn.call(this, this.el, value)
    }
  }

  // Syncs up the view binding with the model.
  sync() {
    if (this.observer) {
      if (this.model !== this.observer.target) {
        let deps = this.options.dependencies

        this.dependencies.forEach(observer => {
          observer.unobserve()
        })

        this.dependencies = []
        this.model = this.observer.target

        if (this.model && deps && deps.length) {
          deps.forEach(dependency => {
            let observer = this.observe(this.model, dependency)
            this.dependencies.push(observer)
          })
        }
      }

      this.set(this.observer.value())
    } else {
      this.set(this.value)
    }
  }

  // Publishes the value currently set on the input element back to the model.
  publish() {
    var value, lastformatterIndex;
    if (this.observer) {
      value = this.getValue(this.el)
      lastformatterIndex = this.options.formatters.length - 1

      this.options.formatters.slice(0).reverse().forEach((formatter, fiReversed) => {
        const fi = lastformatterIndex - fiReversed
        const args = formatter.split(/\s+/)
        const id = args.shift()
        const f = this.view.options.formatters[id]
        const processedArgs = this.parseFormatterArguments(args, fi)

        if (f && f.publish) {
          value = f.publish(value, ...processedArgs)
        }
      })

      this.observer.setValue(value)
    }
  }

  // Subscribes to the model for changes at the specified keypath. Bi-directional
  // routines will also listen for changes on the element to propagate them back
  // to the model.
  bind() {
    this.parseTarget()

    if (this.binder.hasOwnProperty('bind')) {
      this.binder.bind.call(this, this.el)
    }

    if (this.model && this.options.dependencies) {
      this.options.dependencies.forEach(dependency => {
        let observer = this.observe(this.model, dependency)
        this.dependencies.push(observer)
      })
    }

    if (this.view.options.preloadData) {
      this.sync()
    }
  }

  // Unsubscribes from the model and the element.
  unbind() {
    if (this.binder.unbind) {
      this.binder.unbind.call(this, this.el)
    }

    if (this.observer) {
      this.observer.unobserve()
    }


    this.dependencies.forEach(observer => {
      observer.unobserve()
    })

    this.dependencies = []

    Object.keys(this.formatterObservers).forEach(fi => {
      let args = this.formatterObservers[fi]

      Object.keys(args).forEach(ai => {
        args[ai].unobserve()
      })
    })

    this.formatterObservers = {}
  }

  // Updates the binding's model from what is currently set on the view. Unbinds
  // the old model first and then re-binds with the new model.
  update(models = {}) {
    if (this.observer) {
      this.model = this.observer.target
    }

    if (this.binder.update) {
      this.binder.update.call(this, models)
    }
  }

  // Returns elements value
  getValue(el) {
    if (this.binder && this.binder.getValue) {
      return this.binder.getValue.call(this, el)
    } else {
      return getInputValue(el)
    }
  }
}
