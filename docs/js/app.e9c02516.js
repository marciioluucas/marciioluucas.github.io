(function(e){function t(t){for(var r,i,s=t[0],d=t[1],l=t[2],u=0,p=[];u<s.length;u++)i=s[u],Object.prototype.hasOwnProperty.call(o,i)&&o[i]&&p.push(o[i][0]),o[i]=0;for(r in d)Object.prototype.hasOwnProperty.call(d,r)&&(e[r]=d[r]);c&&c(t);while(p.length)p.shift()();return n.push.apply(n,l||[]),a()}function a(){for(var e,t=0;t<n.length;t++){for(var a=n[t],r=!0,s=1;s<a.length;s++){var d=a[s];0!==o[d]&&(r=!1)}r&&(n.splice(t--,1),e=i(i.s=a[0]))}return e}var r={},o={app:0},n=[];function i(t){if(r[t])return r[t].exports;var a=r[t]={i:t,l:!1,exports:{}};return e[t].call(a.exports,a,a.exports,i),a.l=!0,a.exports}i.m=e,i.c=r,i.d=function(e,t,a){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:a})},i.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var a=Object.create(null);if(i.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)i.d(a,r,function(t){return e[t]}.bind(null,r));return a},i.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],d=s.push.bind(s);s.push=t,s=s.slice();for(var l=0;l<s.length;l++)t(s[l]);var c=d;n.push([0,"chunk-vendors"]),a()})({0:function(e,t,a){e.exports=a("56d7")},1100:function(e,t,a){e.exports=a.p+"img/background.76674cf3.jpg"},2142:function(e,t,a){e.exports=a.p+"media/sharp.da71d3df.ogg"},"56d7":function(e,t,a){"use strict";a.r(t);a("e260"),a("e6cf"),a("cca6"),a("a79d");var r=a("2b0e"),o=function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("v-app",{attrs:{dark:""}},[r("v-app-bar",{attrs:{absolute:"",dark:"",app:"",color:"primary",prominent:"",src:a("1100")},scopedSlots:e._u([{key:"img",fn:function(t){var a=t.props;return[r("v-img",e._b({},"v-img",a,!1))]}}])},[r("v-toolbar-title",{staticClass:"font-weight-bold"},[e._v("Enviar Gemidão do ZAP")])],1),r("v-main",[r("v-container",[r("audio",{attrs:{id:"sharp",controls:"",preload:"auto",hidden:""}},[r("source",{attrs:{src:a("a07b"),type:"audio/mpeg"}}),r("source",{attrs:{src:a("2142"),type:"audio/ogg"}}),e._v(" Your browser does not support the audio element. ")]),r("v-card",[r("v-card-title",[e._v("O gemidão do zap")]),r("v-card-subtitle",[e._v("faça uma ligação anonima mandando o gemidão do zap gratuitamente para o celular dos seus amigos ")]),r("v-card-text",[r("span",{staticClass:"caption text-lg-justify"},[e._v(" É simples e fácil, basta preencher o formulario abaixo com o telefone de seu amigo que ligaremos à ele, e quando ele atender, dispararemos o gemidão do zap. ")]),r("v-divider",{staticClass:"mt-3 mb-3"}),r("v-row",[r("v-col",{attrs:{sm:"24",md:"6",lg:"3"}},[r("v-text-field",{directives:[{name:"mask",rawName:"v-mask",value:"(##) #####-####",expression:"'(##) #####-####'"}],attrs:{outlined:"",type:"tel",label:"Telefone do seu amigo",placeholder:"Digite o telefone para ligarmos..."},model:{value:e.phone,callback:function(t){e.phone=t},expression:"phone"}})],1)],1)],1),r("v-card-actions",[r("v-btn",{staticStyle:{"touch-action":"manipulation"},attrs:{large:"",block:"",color:"primary",disabled:!e.phone.match(/\(\d{2,}\) \d{4,}\-\d{4}/)},on:{click:e.sendGemidao}},[e._v("Ligar ")])],1)],1),r("v-row",[r("v-col",[r("div",{staticClass:"ad-container"},[r("Adsense",{attrs:{"data-ad-client":"ca-pub-4225671400356326","data-ad-slot":"8135465187","data-ad-format":"auto","data-full-width-responsive":!0}})],1)])],1),r("div",{attrs:{id:"result"}})],1)],1),r("v-dialog",{attrs:{"hide-overlay":"",persistent:"",width:"300"},model:{value:e.overlay,callback:function(t){e.overlay=t},expression:"overlay"}},[r("v-card",{attrs:{dark:""}},[r("v-card-title",[e._v("Ligando...")]),r("v-card-subtitle",[e._v("Estamos ligando para "+e._s(e.phone)+", por favor aguarde...")]),r("v-card-text",{staticClass:"text-center"},[r("v-progress-circular",{attrs:{color:"primary",indeterminate:"",size:"64"}})],1)],1)],1),r("v-footer",{attrs:{app:""}},[e._v("2020 - Todos os direitos reservados")])],1)},n=[],i={name:"App",data:function(){return{phone:"",overlay:!1}},watch:{},created:function(){this.$vuetify.theme.dark=!0,console.log("production")},methods:{sendGemidao:function(){var e=this;this.overlay=!0,setTimeout((function(){e.overlay=!1,document.getElementById("sharp").play()}),3e3)}}},s=i,d=a("2877"),l=Object(d["a"])(s,o,n,!1,null,null,null),c=l.exports,u=a("ce5b"),p=a.n(u);a("bf40");r["default"].use(p.a);var f=new p.a({theme:{themes:{dark:{primary:"#D30D6F",secondary:"#424242",accent:"#82B1FF",error:"#FF5252",info:"#2196F3",success:"#4CAF50",warning:"#FFC107"}}}}),v=(a("d5e8"),a("5363"),a("b6d0")),m=a("bf74"),g=a.n(m);r["default"].use(a("395c")),r["default"].use(g.a.Adsense),r["default"].use(g.a.InArticleAdsense),r["default"].use(g.a.InFeedAdsense),r["default"].config.productionTip=!1,r["default"].directive("mask",v["a"]),new r["default"]({vuetify:f,render:function(e){return e(c)}}).$mount("#app")},a07b:function(e,t,a){e.exports=a.p+"media/sharp.56fd51fe.mp3"}});
//# sourceMappingURL=app.e9c02516.js.map