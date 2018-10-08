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

  mostrarDatosExistencia();
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

function generarPDF() {
  var contenido = document.getElementById('app').innerHTML;
  var contenidoOriginal = document.body.innerHTML;
  document.body.innerHTML = contenido;
  window.print();
  document.body.innerHTML = contenidoOriginal;
}

$("#btnExcel").click(function (e) {
  var file = new Blob([$('#excel').html()], { type: "application/vnd.ms-excel" });
  var url = URL.createObjectURL(file);
  var a = $("<a />", {
    href: url,
    download: "existencia.xls" }).appendTo("body").get(0).click();
  e.preventDefault();
});

function exportarCSV() {
  var idExistencia = getQueryVariable('id');
  var result = void 0,
      ctr = void 0,
      keys = void 0,
      columnDelimiter = void 0,
      lineDelimiter = void 0;
  db.ref('existencias/' + idExistencia).on('value', function (existencia) {
    var arrayExistencias = [];
    var productos = existencia.val().productos;
    Object.keys(productos).forEach(function (key) {
      arrayExistencias.push(productos[key]);
    });
    var data = arrayExistencias || null;

    var args = { data: arrayExistencias };

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);
    result = '';
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
    var filename = 'existencia.csv';

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

function mostrarDatosExistencia() {
  var datatable = $('#tablaProductos').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  var idExistencia = getQueryVariable('id');

  db.ref('existencias/' + idExistencia).on('value', function (existencia) {
    var _existencia$val = existencia.val(),
        consorcio = _existencia$val.consorcio,
        fecha = _existencia$val.fecha,
        coordinadora = _existencia$val.coordinadora,
        tienda = _existencia$val.tienda,
        zona = _existencia$val.zona;

    $('#consorcio').html(consorcio);
    $('#fecha').html(fecha);
    $('#coordinadora').html(coordinadora);
    $('#tienda').html(tienda);
    $('#zona').html(zona);

    var filas = '';
    var productos = existencia.val().productos;

    datatable.clear().draw();
    var totalPiezas = 0,
        kilosTotales = 0;
    for (var producto in productos) {
      filas += '<tr>\n                  <td>' + producto + '</td>\n                  <td>' + productos[producto].nombre + '</td>\n                  <td>' + productos[producto].piezas + '</td>\n                  <td>' + productos[producto].totalKilos + '</td>\n                  <td><button class="btn btn-xs btn-warning" onclick="editarProducto(\'' + producto + '\')"><i class="fas fa-pencil-alt"></i></button></td>\n                </tr>';
      totalPiezas += productos[producto].piezas;
      kilosTotales += productos[producto].totalKilos;
    }

    $('#totalPiezas').html(totalPiezas);
    $('#kilosTotales').html(kilosTotales.toFixed(2));

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function editarProducto(claveProducto) {
  var idExistencia = getQueryVariable('id');
  $('#modalEditar').modal('show');
  $('#btnActualizar').attr('onclick', 'actualizarProducto(\'' + claveProducto + '\')');
  db.ref('existencias/' + idExistencia + '/productos/' + claveProducto).once('value', function (snapshot) {
    $('#nombreProducto').val(snapshot.val().nombre);
    $('#piezas').val(snapshot.val().piezas);
  });
}

function actualizarProducto(claveProducto) {
  var idExistencia = getQueryVariable('id');
  var consorcio = $('#consorcio').text();
  var piezas = Number($('#piezas').val());

  db.ref('consorcios/' + consorcio + '/productos/' + claveProducto).once('value', function (producto) {
    var empaque = Number(producto.val().empaque);
    var totalKilos = Number((piezas * empaque).toFixed(4));

    db.ref('existencias/' + idExistencia + '/productos/' + claveProducto).update({
      piezas: piezas,
      totalKilos: totalKilos
    });
    $('#modalEditar').modal('hide');

    swal({
      type: 'success',
      title: 'Mensaje',
      text: 'La existencia se actualizó con éxito'
    });
  });
}