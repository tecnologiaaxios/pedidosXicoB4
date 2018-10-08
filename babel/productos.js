'use strict';

var db = firebase.database();
var auth = firebase.auth();
var productos = [];

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

function llenarConsorcios() {}

$('#consorcio').change(function () {});

function mostrarProductos() {
  db.ref('consorcios').on('value', function (snapshot) {
    var consorcios = snapshot.val();
  });
}

new Vue({
  el: '#app',
  data: {
    consorcios: [],
    consorcio: '',
    clave: '',
    claveConsorcio: '',
    nombre: '',
    precioUnitario: 0,
    unidades: ['PZA', 'KG'],
    unidad: '',
    empaque: 0,
    activo: true,
    activoEditar: '',
    productos: [],
    consorcioFiltrar: ''
  },
  computed: {},
  firebase: {
    consorcios: db.ref('consorcios')
  },
  methods: {
    limpiarCampos: function limpiarCampos() {
      this.activo = true;
      this.clave = '';
      this.claveConsorcio = '';
      this.empaque = 0;
      this.nombre = '';
      this.precioUnitario = 0;
      this.unidad = '';
      this.consorcio = '';
    },
    guardarProducto: function guardarProducto() {
      var _this = this;

      if (this.clave != '' && this.claveConsorcio != '' && this.empaque > 0 && this.nombre != '' && this.precioUnitario > 0 && unidad != '') {
        var producto = {
          activo: this.activo,
          clave: this.clave,
          claveConsorcio: this.claveConsorcio,
          empaque: this.empaque,
          nombre: this.nombre,
          precioUnitario: this.precioUnitario,
          unidad: this.unidad
        };

        db.ref('productos/' + this.consorcio).once('value', function (snapshot) {
          if (snapshot.val() == null) {
            db.ref('consorcios/' + _this.consorcio + '/productos/' + _this.clave).set(producto);
            db.ref('productos/' + _this.consorcio + '/' + _this.clave).set(producto);

            $('#modalAgregarProducto').modal('hide');
            swal({
              icon: 'success',
              text: 'El producto se ingresó'
            });
            _this.limpiarCampos();
          } else {
            var listaProductos = Object.keys(snapshot.val());
            if (listaProductos.includes(_this.clave)) {
              $('#modalAgregarProducto').modal('hide');
              swal({
                icon: 'error',
                text: 'Ya hay un producto con esa clave'
              });
              _this.limpiarCampos();
            } else {
              db.ref('consorcios/' + _this.consorcio + '/productos/' + _this.clave).set(producto);
              db.ref('productos/' + _this.consorcio + '/' + _this.clave).set(producto);

              $('#modalAgregarProducto').modal('hide');
              swal({
                icon: 'success',
                text: 'El producto se ingresó'
              });
              _this.limpiarCampos();
            }
          }
        });
      }
    },
    abrirModalEditar: function abrirModalEditar(claveProducto) {
      var _this2 = this;

      db.ref('consorcios/' + this.consorcioFiltrar + '/productos/' + claveProducto).once('value', function (producto) {
        var datos = producto.val();

        _this2.nombre = datos.nombre;
        _this2.clave = producto.key;
        _this2.claveConsorcio = datos.claveConsorcio;
        _this2.precioUnitario = datos.precioUnitario;
        _this2.empaque = datos.empaque;
        _this2.consorcio = _this2.consorcioFiltrar;
        _this2.unidad = datos.unidad;
        _this2.activoEditar = datos.activo;
      });
    },
    filtrarProductos: function filtrarProductos() {
      var _this3 = this;

      this.consorcios.forEach(function (consorcio) {
        if (consorcio['.key'] == _this3.consorcioFiltrar) {
          _this3.productos = consorcio.productos;
        }
      });
    },
    estado: function estado(activo) {
      return activo ? '<span class="badge badge-success">Activo</span>' : '<span class="badge badge-secondary">Inactivo</span>';
    }
  }
});

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

function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

function logout() {
  auth.signOut();
}