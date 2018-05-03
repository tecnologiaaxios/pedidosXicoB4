'use strict';

var db = firebase.database();
var auth = firebase.auth();

var LANGUAGE = {
  searchPlaceholder: "Buscar",
  sProcessing: 'Procesando...',
  sLengthMenu: 'Mostrar _MENU_ registros',
  sZeroRecords: 'No se encontraron resultados',
  sEmptyTable: 'Ningún dato disponible en esta tabla',
  sInfo: 'Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros',
  sInfoEmpty: 'Mostrando registros del 0 al 0 de un total de 0 registros',
  sInfoFiltered: '(filtrado de un total de _MAX_ registros)',
  sInfoPostFix: '',
  sSearch: '<i style="color: #4388E5;" class="glyphicon glyphicon-search"></i>',
  sUrl: '',
  sInfoThousands: ',',
  sLoadingRecords: 'Cargando...',
  oPaginate: {
    sFirst: 'Primero',
    sLast: 'Último',
    sNext: 'Siguiente',
    sPrevious: 'Anterior'
  },
  oAria: {
    sSortAscending: ': Activar para ordenar la columna de manera ascendente',
    sSortDescending: ': Activar para ordenar la columna de manera descendente'
  }
};

function logout() {
  auth.signOut();
}

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip();
  $('.input-group.date').datepicker({
    autoclose: true,
    format: "dd/mm/yyyy",
    // startDate: "today",
    language: "es"
  });

  llenarSelectZona();
  llenarSelectConsorcio();
  llenarSelectTienda();
  llenarSelectProducto();
});

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

function haySesion() {
  auth.onAuthStateChanged(function (user) {
    //si hay un usuario
    if (user) {
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
  });
}

function llenarSelectZona() {
  db.ref('regiones').once('value', function (regiones) {
    var zonas = regiones.val();

    var options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (var zona in zonas) {
      options += '<option value="' + zona + '">' + zona + '</option>';
    }

    $('#zona').html(options);
  });
}

function llenarSelectConsorcio() {
  db.ref('productos').once('value', function (productos) {
    var consorcios = productos.val();

    var options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (var consorcio in consorcios) {
      options += '<option value="' + consorcio + '">' + consorcio + '</option>';
    }

    $('#consorcio').html(options);
  });
}

function llenarSelectTienda() {
  db.ref('regiones').once('value', function (snapshot) {
    var regiones = snapshot.val();

    var options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (var region in regiones) {
      var tiendas = regiones[region];

      for (var tienda in tiendas) {
        options += '<option value="' + tienda + '">' + tienda + '</option>';
      }
    }
    $('#tienda').html(options);
  });
}

function llenarSelectProducto() {
  db.ref('listadoProductos').once('value', function (snapshot) {
    var productos = snapshot.val();
    var options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (var producto in productos) {
      options += '<option value="' + producto + '">' + producto + '</option>';
    }

    $('#producto').html(options);
  });
}

function mostrarNotificaciones() {
  var usuario = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + usuario + '/lista');
  notificacionesRef.on('value', function (snapshot) {
    var lista = snapshot.val();
    var lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';

    var arrayNotificaciones = [];
    for (var notificacion in lista) {
      arrayNotificaciones.unshift(lista[notificacion]);
    }

    for (var i in arrayNotificaciones) {
      var date = arrayNotificaciones[i].fecha;
      moment.locale('es');
      var fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();

      lis += '<li>\n                <a>\n                  <div>\n                    <i class="fa fa-comment fa-fw"></i>' + arrayNotificaciones[i].mensaje + '\n                    <span class="pull-right text-muted small">' + fecha + '</span>\n                  </div>\n                </a>\n              </li>';
    }
    $('#contenedorNotificaciones').html(lis);
  });
}

function mostrarContador() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.on('value', function (snapshot) {
    var cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    } else {
      $('#spanNotificaciones').hide();
    }
  });
}

Vue.use(VueFire);

new Vue({
  el: '#app',
  data: {
    /* zona: 'Seleccionar', */
    consorcio: 'Seleccionar',
    tienda: 'Seleccionar',
    producto: 'Seleccionar',
    precioLista: 0,
    precioOferta: 0,
    fechaInicio: '',
    fechaFin: '',
    productos: []
  },
  computed: {
    fechaInicioFormateada: function fechaInicioFormateada() {
      var fecha = this.fechaInicio.split('-');
      return fecha[2] + '/' + fecha[1] + '/' + fecha[0];
    },
    fechaFinFormateada: function fechaFinFormateada() {
      var fecha = this.fechaFin.split('-');
      return fecha[2] + '/' + fecha[1] + '/' + fecha[0];
    }
  },
  firebase: {
    ofertas: db.ref('ofertas')
  },
  methods: {
    limpiarCampos: function limpiarCampos() {
      this.producto = "Seleccionar", this.precioOferta = 0, this.fechaInicio = "", this.fechaFin = "";
    },
    agregarProducto: function agregarProducto() {
      var _this = this;

      if (this.producto != 'Seleccionar' && this.precioOferta > 0 && this.fechaInicio != '' && this.fechaFin != '') {
        db.ref('listadoProductos').child(this.producto).once('value', function (snapshot) {
          var datos = snapshot.val();

          var producto = {
            clave: _this.producto,
            nombre: datos.nombre,
            precioLista: datos.precioUnitario,
            precioOferta: _this.precioOferta,
            fechaInicio: _this.fechaInicioFormateada,
            fechaFin: _this.fechaFinFormateada
          };
          _this.productos.push(producto);
          _this.limpiarCampos();
        });
      }
    },
    guardarOferta: function guardarOferta() {
      var _this2 = this;

      if (this.consorcio != "Seleccionar" && this.productos.length > 0) {
        db.ref('ofertas').once('value', function (snapshot) {
          var ofertas = snapshot.val();
          if (ofertas != undefined) {
            var keys = Object.keys(ofertas),
                last = keys[keys.length - 1],
                ultimaOferta = ofertas[last],
                lastclave = ultimaOferta.clave,
                clave = lastclave + 1;

            if (_this2.tienda == "Seleccionar") {
              db.ref('ofertas').push({
                clave: clave,
                /* zona: this.zona, */
                consorcio: _this2.consorcio,
                tienda: '',
                productos: _this2.productos
              });
            } else {
              db.ref('ofertas').push({
                clave: clave,
                /* zona: this.zona, */
                consorcio: _this2.consorcio,
                tienda: _this2.tienda,
                productos: _this2.productos
              });
            }
          } else {
            if (_this2.tienda == "Seleccionar") {
              db.ref('ofertas').push({
                clave: 1,
                /* zona: this.zona, */
                consorcio: _this2.consorcio,
                tienda: '',
                productos: _this2.productos
              });
            } else {
              db.ref('ofertas').push({
                clave: 1,
                /* zona: this.zona, */
                consorcio: _this2.consorcio,
                tienda: _this2.tienda,
                productos: _this2.productos
              });
            }
          }

          _this2.consorcio = "Seleccionar";
          _this2.tienda = "Seleccionar", _this2.productos = [];
          _this2.limpiarCampos();
        });
      }

      /* if(this.zona != "Seleccionar" && this.consorcio != "Seleccionar" && this.tienda != "Seleccionar" && this.productos.length > 0) {
        
      } */
    }
  }
});

function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});