function newAltboiler () {
  return new _Altboiler(_altboilerScope.maniUtils, _altboilerScope.boilerUtils)
}

function cleanLB (str) {
  while(str.indexOf('\n') > -1) str = str.replace('\n', '')
  return str
}

Tinytest.add('altboiler.config', function (test) {
  var altboiler = newAltboiler()
  test.equal(typeof altboiler.config, 'function', 'It should be a function')
  test.isTrue(!!newAltboiler().config({}), 'It should be able to handle objects')
  altboiler.config({
    css: ['div {}'],
    js: ['console.log("moaarr drama!")'],
    onLoad: ['console.log("loadeed!")'],
    action: function () { return 'someAction...' },
  })
  test.matches(cleanLB(altboiler.Boilerplate()), /<style\stype="text\/css">.*div\s{}/gm, 'The hooked css should be rendered')
  test.matches(cleanLB(altboiler.Boilerplate()), /<script.*console\.log\("moaarr\sdrama!"\)/gm, 'The hooked js should be rendered')
  test.matches(cleanLB(altboiler.Boilerplate()), /<script.*console\.log\("loadeed!"\)/gm, 'The hooked js should be rendered')
  ; (function () {
    var altboiler = newAltboiler()
    altboiler.config({
      action: '<script>console.log("damn trolls")</script>'
    })
    test.matches(cleanLB(altboiler.Boilerplate()), /<body>.*"damn\strolls"/gm, 'The action should be rendered inside the body')
  })()
})

Tinytest.add('altboiler.Boilerplate', function (test) {
  var altboiler = newAltboiler()
  test.isTrue(altboiler.Boilerplate().indexOf('<body>') > -1, 'Its return value should contain a body element')
  test.isFalse(altboiler.Boilerplate().indexOf('<DOCTYPE') > -1, 'Its return value should\'nt contain a doctype')
  test.isTrue(altboiler.Boilerplate().indexOf('<head>') > -1, 'Its return value should contain a head element')
  test.isTrue(altboiler.Boilerplate().indexOf('src="/altboiler/main.js"') > -1, 'It should render a script tag that gets the /altboiler/main.js')
})

Tinytest.add('altboiler.renderAction', function (test) {
  var altboiler = newAltboiler()
  test.equal(altboiler.renderAction('someString'), 'someString', 'It should return a string if it\'s not a template')
  test.equal(altboiler.renderAction(function () {return '21'}), '21', 'It should be able to handle functions returning strings')
})
