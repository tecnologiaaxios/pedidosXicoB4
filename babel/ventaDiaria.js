'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
  sSearch: '<i style="color: #4388E5;" class="fas fa-search"></i>',
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

  mostrarDatosVentaDiaria();
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
    if (user) {
      mostrarContador();
    } else {
      $(location).attr("href", "index.html");
    }
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

      lis += '<li>\n                  <a>\n                    <div>\n                      <i class="fa fa-comment fa-fw"></i>' + arrayNotificaciones[i].mensaje + '\n                      <span class="pull-right text-muted small">' + fecha + '</span>\n                    </div>\n                  </a>\n                </li>';
    }
    $('#contenedorNotificaciones').html(lis);
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

function mostrarDatosVentaDiaria() {
  var datatable = $('#tablaProductos').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    language: LANGUAGE,
    scrollY: "500px",
    scrollCollapse: true
  });

  var idVentaDiaria = getQueryVariable('id');

  db.ref('ventasDiarias/' + idVentaDiaria).on('value', function (venta) {
    var _venta$val = venta.val(),
        consorcio = _venta$val.consorcio,
        fecha = _venta$val.fecha,
        nombrePromotora = _venta$val.nombrePromotora,
        productos = _venta$val.productos,
        tienda = _venta$val.tienda,
        zona = _venta$val.zona,
        totalKilos = _venta$val.totalKilos,
        totalPesos = _venta$val.totalPesos;

    $('#consorcio').html(consorcio);
    $('#fecha').html(fecha);
    $('#promotora').html(nombrePromotora);
    $('#idPromotora').html(idPromotora);
    $('#tienda').html(tienda);
    $('#zona').html(zona);

    var filas = '';

    datatable.clear().draw();
    // let totalKilos = 0, totalPesos = 0;
    for (var producto in productos) {
      filas += '<tr>\n                  <td>' + producto + '</td>\n                  <td>' + productos[producto].nombre + '</td>\n                  <td>' + productos[producto].kilos + '</td>\n                  <td>$ ' + productos[producto].pesos + '</td>\n                  <td><button class="btn btn-xs btn-warning" onclick="editarProducto(\'' + producto + '\')"><i class="fas fa-pencil-alt"></i></button></td>\n                </tr>';
      // totalKilos += productos[producto].kilos;
      // totalPesos += productos[producto].pesos;
    }

    $('#totalKilos').html(totalKilos + ' kg');
    $('#totalPesos').html('$ ' + totalPesos.toFixed(2));

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function editarProducto(claveProducto) {
  var idVentaDiaria = getQueryVariable('id');
  var consorcio = $('#consorcio').text();
  $('#modalEditar').modal('show');
  $('#btnActualizar').attr('onclick', 'actualizarProducto(\'' + claveProducto + '\')');
  db.ref('ventasDiarias/' + idVentaDiaria + '/productos/' + claveProducto).once('value', function (snapshot) {
    $('#nombreProducto').val(snapshot.val().nombre);
    $('#kilos').val(snapshot.val().kilos);
    $('#pesos').val(snapshot.val().pesos);
  });
  db.ref('consorcios/' + consorcio + '/productos/' + claveProducto).once('value', function (snapshot) {
    $('#precio').val(snapshot.val().precioUnitario);
  });
}

$('#kilos').keyup(function () {
  var kilos = Number($('#kilos').val());
  var precio = Number($('#precio').val());
  var pesos = Number((kilos * precio).toFixed(2));
  $('#pesos').val(pesos);
});

function actualizarProducto(claveProducto) {
  var idVenta = getQueryVariable('id');
  var kilos = Number($('#kilos').val());
  var pesos = Number($('#pesos').val());

  db.ref('ventasDiarias/' + idVenta + '/productos/' + claveProducto).update({
    kilos: kilos,
    pesos: pesos
  });
  $('#modalEditar').modal('hide');

  swal({
    type: 'success',
    title: 'Mensaje',
    text: 'La venta se actualizó con éxito'
  });
}

function exportarCSV() {
  var idVenta = getQueryVariable('id');
  var result = void 0,
      ctr = void 0,
      keys = void 0,
      columnDelimiter = void 0,
      lineDelimiter = void 0;
  db.ref('ventasDiarias/' + idVenta).on('value', function (venta) {
    var _venta$val2 = venta.val(),
        consorcio = _venta$val2.consorcio,
        fecha = _venta$val2.fecha,
        idPromotora = _venta$val2.idPromotora,
        nombrePromotora = _venta$val2.nombrePromotora,
        productos = _venta$val2.productos,
        tienda = _venta$val2.tienda,
        totalKilos = _venta$val2.totalKilos,
        totalPesos = _venta$val2.totalPesos,
        zona = _venta$val2.zona;

    var arrayProductos = [];

    result = '\nConsorcio: ' + consorcio + '\n\n              Fecha: ' + fecha + '\n\n              Id promotora ' + idPromotora + '\n\n              Promotora: ' + nombrePromotora + '\n\n              Tienda: ' + tienda + '\n\n              Total en kilos: ' + totalKilos + '\n\n              Total en pesos: ' + totalPesos + '\n\n              \n';

    Object.keys(productos).forEach(function (key) {
      var _arrayProductos$push;

      var _productos$key = productos[key],
          nombre = _productos$key.nombre,
          kilos = _productos$key.kilos,
          pesos = _productos$key.pesos;


      arrayProductos.push((_arrayProductos$push = {
        Clave: key,
        Nombre: nombre
      }, _defineProperty(_arrayProductos$push, 'Total Kilos', kilos), _defineProperty(_arrayProductos$push, 'Total Pesos', pesos), _arrayProductos$push));
    });
    var data = arrayProductos || null;

    var args = { data: arrayProductos };

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);
    /*     result = ''; */
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function (item) {
      ctr = 0;
      keys.forEach(function (key) {
        if (ctr > 0) result += columnDelimiter;

        result += item[key];
        ctr++;
      });
      result += lineDelimiter;
    });

    var csv = result;
    if (csv == null) return;
    var filename = 'venta diaria.csv';

    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    var datos = encodeURI(csv);
    var link = document.createElement('a');
    link.setAttribute('href', datos);
    link.setAttribute('download', filename);
    link.click();
  });
}