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

  $('#tablaProductos').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  llenarSelectZonas();
  mostrarTodosPedidos();
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

$('#filtro').change(function () {
  var filtro = $(this).val();

  if (filtro === "Todos") {
    $('#zona').attr('readonly', true);
    $('#fechaInicio').attr('readonly', true);
    $('#fechaFin').attr('readonly', true);
    $('#btnBuscar').attr('disabled', true);
    limpiarCampos();

    mostrarTodosPedidos();
  } else {
    $('#zona').attr('readonly', false);
    $('#fechaInicio').attr('readonly', false);
    $('#fechaFin').attr('readonly', false);
    $('#btnBuscar').attr('disabled', false);
  }
});

var filtrarPedidos = function filtrarPedidos() {
  var zona = $('#zona').val();
  var fechaInicio = $('#fechaInicio').val();
  var fechaFin = $('#fechaFin').val();
  var kgTotales = 0;
  var pzTotales = 0;

  var desde = fechaInicio.split('-');
  var hasta = fechaFin.split('-');

  var fechaDesde = new Date(desde[1] + '/' + desde[2] + '/' + desde[0]);
  var fechaHasta = new Date(hasta[1] + '/' + hasta[2] + '/' + hasta[0]);

  if (zona && fechaInicio && fechaFin) {
    var _pedidos = JSON.parse(localStorage.getItem('pedidosEntrada'));
    var filas = "";
    var datatable = $('#pedidos').DataTable({
      data: _pedidos,
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });

    datatable.clear();

    for (var pedido in _pedidos) {
      var encabezado = _pedidos[pedido].encabezado;
      var fechaPedido = encabezado.fechaCaptura;
      var date = fechaPedido.split('/');
      var fechaCaptura = new Date(date[1] + '/' + date[0] + '/' + date[2]);
      if (encabezado.ruta === zona && fechaCaptura >= fechaDesde && fechaCaptura <= fechaHasta) {
        var numOrden = encabezado.numOrden || "";
        var totalKilos = encabezado.totalKilos || "";
        var totalPiezas = encabezado.totalPiezas || "";
        moment.locale('es');
        var fechaMostrar = moment(date[1] + '/' + date[0] + '/' + date[2]).format('LL');
        kgTotales += Number(totalKilos);
        pzTotales += Number(totalPiezas);

        filas += '<tr>\n                    <td class="text-center">' + encabezado.clave + '</td>\n                    <td class="text-center">' + numOrden + '</td>\n                    <td class="text-center">' + fechaMostrar + '</td>\n                    <td>' + encabezado.tienda + '</td>\n                    <td>' + encabezado.ruta + '</td>\n                    <td>' + totalKilos + '</td>\n                    <td>' + totalPiezas + '</td>\n                  </tr>';
      }
    }
    $('#kgTotales').html('Kg: ' + kgTotales.toFixed(4));
    $('#pzTotales').html('Pz: ' + pzTotales.toFixed(4));
    //$('#pedidos tbody').html(filas);
    datatable.rows.add($(filas)).columns.adjust().draw();
  }
  if (zona && fechaInicio.length == 0 && fechaFin.length == 0) {
    var _pedidos2 = JSON.parse(localStorage.getItem('pedidosEntrada'));
    var _filas = "";
    var _datatable = $('#pedidos').DataTable({
      data: _pedidos2,
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });

    _datatable.clear();

    for (var _pedido in _pedidos2) {
      var _encabezado = _pedidos2[_pedido].encabezado;
      var _fechaPedido = _encabezado.fechaCaptura;
      var _date = _fechaPedido.split('/');
      var _fechaCaptura = new Date(_date[1] + '/' + _date[0] + '/' + _date[2]);
      if (zona === _encabezado.ruta) {
        var _numOrden = _encabezado.numOrden || "";
        var _totalKilos = _encabezado.totalKilos || "";
        var _totalPiezas = _encabezado.totalPiezas || "";
        kgTotales += Number(_totalKilos);
        pzTotales += Number(_totalPiezas);

        _filas += '<tr>\n                    <td class="text-center">' + _encabezado.clave + '</td>\n                    <td class="text-center">' + _numOrden + '</td>\n                    <td class="text-center">' + _encabezado.fechaCaptura + '</td>\n                    <td>' + _encabezado.tienda + '</td>\n                    <td>' + _encabezado.ruta + '</td>\n                    <td>' + _totalKilos + '</td>\n                    <td>' + _totalPiezas + '</td>\n                  </tr>';
      }
    }
    $('#kgTotales').html('Kg: ' + kgTotales.toFixed(4));
    $('#pzTotales').html('Pz: ' + pzTotales.toFixed(4));
    //$('#pedidos tbody').html(filas);
    _datatable.rows.add($(_filas)).columns.adjust().draw();
  }
  if (zona === null && fechaInicio && fechaFin) {
    var _pedidos3 = JSON.parse(localStorage.getItem('pedidosEntrada'));
    var _filas2 = "";
    var _datatable2 = $('#pedidos').DataTable({
      data: _pedidos3,
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });

    _datatable2.clear();

    for (var _pedido2 in _pedidos3) {
      var _encabezado2 = _pedidos3[_pedido2].encabezado;
      var _fechaPedido2 = _encabezado2.fechaCaptura;
      var _date2 = _fechaPedido2.split('/');
      var _fechaCaptura2 = new Date(_date2[1] + '/' + _date2[0] + '/' + _date2[2]);
      if (_fechaCaptura2 >= fechaDesde && _fechaCaptura2 <= fechaHasta) {
        var _numOrden2 = _encabezado2.numOrden || "";
        var _totalKilos2 = _encabezado2.totalKilos || "";
        var _totalPiezas2 = _encabezado2.totalPiezas || "";
        kgTotales += Number(_totalKilos2);
        pzTotales += Number(_totalPiezas2);

        _filas2 += '<tr>\n                    <td class="text-center">' + _encabezado2.clave + '</td>\n                    <td class="text-center">' + _numOrden2 + '</td>\n                    <td class="text-center">' + _encabezado2.fechaCaptura + '</td>\n                    <td>' + _encabezado2.tienda + '</td>\n                    <td>' + _encabezado2.ruta + '</td>\n                    <td>' + _totalKilos2 + '</td>\n                    <td>' + _totalPiezas2 + '</td>\n                  </tr>';
      }
    }
    $('#kgTotales').html('Kg: ' + kgTotales.toFixed(4));
    $('#pzTotales').html('Pz: ' + pzTotales.toFixed(4));
    //$('#pedidos tbody').html(filas);
    _datatable2.rows.add($(_filas2)).columns.adjust().draw();
  }
};

var mostrarTodosPedidos = function mostrarTodosPedidos() {
  var pedidos = JSON.parse(localStorage.getItem('filtrarPedidos'));
  var kgTotales = 0;
  var pzTotales = 0;

  var datatable = $('#pedidos').DataTable({
    data: pedidos,
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
    columns: [{ data: 'encabezado.clave', className: 'text-center' }, { data: 'encabezado.numOrden', defaultContent: "" }, {
      data: 'encabezado.fechaCaptura',
      render: function render(fechaCaptura) {
        moment.locale('es');
        return moment(fechaCaptura.substr(3, 2) + '/' + fechaCaptura.substr(0, 2) + '/' + fechaCaptura.substr(6, 4)).format('LL');
      }
    }, { data: 'encabezado.tienda' }, { data: 'encabezado.ruta', className: 'text-center' }, {
      data: 'encabezado.totalKilos',
      render: function render(totalKilos) {
        kgTotales += Number(totalKilos);
        return totalKilos;
      },
      className: 'text-center',
      defaultContent: "" }, {
      data: 'encabezado.totalPiezas',
      render: function render(totalPiezas) {
        pzTotales += Number(totalPiezas);
        return totalPiezas;
      },
      className: 'text-center',
      defaultContent: ""
    }],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  $('#kgTotales').html('Kg: ' + kgTotales.toFixed(4));
  $('#pzTotales').html('Pz: ' + pzTotales.toFixed(4));
};

var limpiarCampos = function limpiarCampos() {
  $('#fechaInicio').val('');
  $('#fechaFin').val('');
};

function llenarSelectZonas() {
  var zonas = JSON.parse(localStorage.getItem('zonas'));
  var options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
  for (var zona in zonas) {
    options += '<option value="' + zona + '">' + zona + '</option>';
  }

  $('#zona').html(options);
  $('#zonaProducto').html(options);
}

function llenarSelectClaves() {
  var claves = JSON.parse(localStorage.getItem('claves'));
  var options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
  for (var clave in claves) {
    options += '<option value="' + clave + '">' + clave + '</option>';
  }
}

var filtrarProductos = function filtrarProductos() {
  var estadisticasProductos = JSON.parse(localStorage.getItem('estadisticasProductos'));
  var clave = $('#clave').val();
  var zona = $('#zona').val();
  var fecha = $('#fecha').val();
  var datatable = $('#productos').DataTable({
    data: pedidos,
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  datatable.clear();

  var filas = "";
  for (var estadistica in estadisticasProductos) {
    var producto = estadisticasProductos[estadistica];
    if (clave && zona && fecha) {
      if (producto.clave === clave && producto.zona === zona && producto.fecha === fecha) {
        filas += '<tr>\n                    <td>' + producto.clave + '</td>\n                    <td>' + producto.nombre + '</td>\n                    <td>' + producto.zona + '</td>\n                    <td>' + producto.fecha + '</td>\n                    <td>' + producto.totalKilos + '</td>\n                    <td>' + producto.totalPiezas + '</td>\n                  </tr>';
      }
    }
    if (clave && zona && fecha.length === 0) {
      if (producto.clave === clave && producto.zona === zona) {
        filas += '<tr>\n                    <td>' + producto.clave + '</td>\n                    <td>' + producto.nombre + '</td>\n                    <td>' + producto.zona + '</td>\n                    <td>' + producto.fecha + '</td>\n                    <td>' + producto.totalKilos + '</td>\n                    <td>' + producto.totalPiezas + '</td>\n                  </tr>';
      }
    }
    if (clave && zona === null && fecha) {
      if (producto.clave === clave && producto.fecha === fecha) {
        filas += '<tr>\n                    <td>' + producto.clave + '</td>\n                    <td>' + producto.nombre + '</td>\n                    <td>' + producto.zona + '</td>\n                    <td>' + producto.fecha + '</td>\n                    <td>' + producto.totalKilos + '</td>\n                    <td>' + producto.totalPiezas + '</td>\n                  </tr>';
      }
    }
    if (clave === null & zona && fecha) {
      if (producto.zona = zona && producto.fecha == fecha) {
        filas += '<tr>\n                    <td>' + producto.clave + '</td>\n                    <td>' + producto.nombre + '</td>\n                    <td>' + producto.zona + '</td>\n                    <td>' + producto.fecha + '</td>\n                    <td>' + producto.totalKilos + '</td>\n                    <td>' + producto.totalPiezas + '</td>\n                  </tr>';
      }
    }
    if (clave && zona === null && fecha.length === 0) {
      if (producto.clave === clave) {
        filas += '<tr>\n                    <td>' + producto.clave + '</td>\n                    <td>' + producto.nombre + '</td>\n                    <td>' + producto.zona + '</td>\n                    <td>' + producto.fecha + '</td>\n                    <td>' + producto.totalKilos + '</td>\n                    <td>' + producto.totalPiezas + '</td>\n                  </tr>';
      }
    }
    if (clave === null && zona && fecha.length === 0) {
      if (producto.zona === zona) {
        filas += '<tr>\n                    <td>' + producto.clave + '</td>\n                    <td>' + producto.nombre + '</td>\n                    <td>' + producto.zona + '</td>\n                    <td>' + producto.fecha + '</td>\n                    <td>' + producto.totalKilos + '</td>\n                    <td>' + producto.totalPiezas + '</td>\n                  </tr>';
      }
    }
    if (clave === null && zona === null && fecha) {
      if (producto.fecha === fecha) {
        filas += '<tr>\n                    <td>' + producto.clave + '</td>\n                    <td>' + producto.nombre + '</td>\n                    <td>' + producto.zona + '</td>\n                    <td>' + producto.fecha + '</td>\n                    <td>' + producto.totalKilos + '</td>\n                    <td>' + producto.totalPiezas + '</td>\n                  </tr>';
      }
    }
  }
  datatable.rows.add($(filas)).columns.adjust().draw();
};

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

/* function limpiar() {
  $('#clave').val('');
  $('#zonaProducto').val('');
  $('#fecha').val('');

  $('#tablaProductos').DataTable().destroy();
} */

/* Vue.component('tabla-pedidos', {
  template: ``,
  props: {
    pedidos: {
      type: Array
    }
  },
  data() {

  },
  updated() {
    $('#tablaProductos').DataTable({
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],  
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
  }
}); */

/*Vue.component('todos', {
  template: `
    <table width="100%" id="pedidos" class="table table-condensed table-bordered table-striped table-hover">
      <thead>
        <tr>
          <th class="text-center">Clave</th>
          <th class="text-center">Núm. orden</th>
          <th>Fecha captura</th>
          <th>Tienda</th>
          <th>Zona</th>
          <th class="text-center">Total Kg</th>
          <th class="text-center">Total Pz</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pedido in pedidos">
          <td class="text-center">{{ pedido.encabezado.clave }}</td>
          <td class="text-center">{{ pedido.encabezado.numOrden || "" }}</td>
          <td>{{ pedido.encabezado.fechaCaptura }}</td>
          <td>{{ pedido.encabezado.tienda }}</td>
          <td class="text-center">{{ pedido.encabezado.ruta }}</td>
          <td class="text-center">{{ pedido.encabezado.totalKilos }}</td>
          <td class="text-center">{{ pedido.encabezado.totalPiezas }}</td>
        </tr>
      </tbody>
    </table>
  `,
  beforeCreate() {
    let pedidos = JSON.parse(localStorage.getItem('filtrarPedidos'));
    this.pedidos = pedidos;
  },
  data() {
    pedidos: []
  },
  computed: {
    fechas() {
      return(
        pedidos.map(function(pedido) {
          let fechaPedido = pedido.encabezado.fechaCaptura;
          moment.locale('es');
          return moment(`${fechaCaptura.substr(3,2)}/${fechaCaptura.substr(0,2)}/${fechaCaptura.substr(6,4)}`).format('LL')
        })
      )
    }
  }
})*/

/*const mv = new Vue({
  el: '#app',
  data: {
    filtro: '',
    zona: 'Seleccionar',
    fechaInicio: '',
    fechaFin: '',
    desde: [],
    hasta: [],
    fechaDesde: null,
    fechaHasta: null
  },
  methods: {
     habilitar() {
      if(this.filtro === "PorZona") {
        $('#zona').attr('readonly', false);
        $('#fechaInicio').attr('readonly', false);
        $('#fechaFin').attr('readonly', false);
        $('#btnBuscar').attr('disabled', false);
      }
      if(this.filtro === "Todos") {
        this.mostrarTodos();
      }
      
    }, */
/* mostrarTodos() {
  console.log("metodo todos")
}, */
/* filtrar() {
  this.desde = fechaInicio.split('-');
  this.hasta = fechaFin.split('-');
   this.fechaDesde = new Date(`${desde[1]}/${desde[2]}/${desde[0]}`);
  this.fechaHasta = new Date(`${hasta[1]}/${hasta[2]}/${hasta[0]}`);
   if(zona && fechaInicio && fechaFin) {
    let pedidos = JSON.parse(localStorage.getItem('pedidosEntrada'));
    let filas = "";
    let datatable = $('#pedidos').DataTable({
      data: pedidos,
      pageLength: 25,
      lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todos"]],     
      destroy: true,
      ordering: false,
      language: LANGUAGE
    });
     datatable.clear();
     for(let pedido in pedidos) {
      let encabezado = pedidos[pedido].encabezado;
      let fechaPedido = encabezado.fechaCaptura;
      let date = fechaPedido.split('/');
      let fechaCaptura = new Date(`${date[1]}/${date[0]}/${date[2]}`);
      if(encabezado.ruta === zona && (fechaCaptura >= fechaDesde && fechaCaptura <= fechaHasta)) {
        let numOrden = encabezado.numOrden || "";
        let totalKilos = encabezado.totalKilos || "";
        let totalPiezas = encabezado.totalPiezas || "";
        moment.locale('es');
        let fechaMostrar = moment(`${date[1]}/${date[0]}/${date[2]}`).format('LL')
        kgTotales += Number(totalKilos);
        pzTotales += Number(totalPiezas);
         filas += `<tr>
                    <td class="text-center">${encabezado.clave}</td>
                    <td class="text-center">${numOrden}</td>
                    <td class="text-center">${fechaMostrar}</td>
                    <td>${encabezado.tienda}</td>
                    <td>${encabezado.ruta}</td>
                    <td>${totalKilos}</td>
                    <td>${totalPiezas}</td>
                  </tr>`;
      }
    }
    $('#kgTotales').html(`Kg: ${kgTotales.toFixed(4)}`);
    $('#pzTotales').html(`Pz: ${pzTotales.toFixed(4)}`);
    //$('#pedidos tbody').html(filas);
    datatable.rows.add($(filas)).columns.adjust().draw();
  }
} 
}
})*/

function verNotificaciones() {
  var uid = auth.currentUser.uid;
  var notificacionesRef = db.ref('notificaciones/almacen/' + uid);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});