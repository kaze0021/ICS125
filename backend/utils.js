const console_prefix = () => {
   function format(num) {
      return num.toString().padStart(2, "0")
   }

   d = new Date()
   return `[${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${format(d.getHours())}:${format(d.getMinutes())}:${format(d.getSeconds())}] `
}

const log = function() {
   a = [console_prefix()].concat(Array.from(arguments))
   console.log.apply(console, a)
}

module.exports = {
   log
}
