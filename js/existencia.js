const db = firebase.database();
const auth = firebase.auth();

const LANGUAGE = {
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
  let query = window.location.search.substring(1);
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] == variable) { return pair[1]; }
  }
  return (false);
}

function haySesion() {
  auth.onAuthStateChanged((user) => {
    if (user) {
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

function mostrarNotificaciones() {
    let usuario = auth.currentUser.uid;
    let notificacionesRef = db.ref(`notificaciones/almacen/${usuario}/lista`);
    notificacionesRef.on('value', function (snapshot) {
      let lista = snapshot.val();
      let lis = '<li class="dropdown-header">Notificaciones</li><li class="divider"></li>';
  
      let arrayNotificaciones = [];
      for (let notificacion in lista) {
        arrayNotificaciones.unshift(lista[notificacion]);
      }
  
      for (let i in arrayNotificaciones) {
        let date = arrayNotificaciones[i].fecha;
        moment.locale('es');
        let fecha = moment(date, "MMMM DD YYYY, HH:mm:ss").fromNow();
  
        lis += `<li>
                  <a>
                    <div>
                      <i class="fa fa-comment fa-fw"></i>${arrayNotificaciones[i].mensaje}
                      <span class="pull-right text-muted small">${fecha}</span>
                    </div>
                  </a>
                </li>`;
      }
      $('#contenedorNotificaciones').html(lis);
    });
  }

function verNotificaciones() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.update({ cont: 0 });
}

$('#campana').click(function () {
  verNotificaciones();
});

function logout() {
  auth.signOut();
}

function mostrarDatosExistencia() {
  let datatable = $('#tablaProductos').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  let idExistencia = getQueryVariable('id');

  db.ref(`existencias/${idExistencia}`).on('value', existencia => {
    let { consorcio, fecha, coordinadora, tienda, zona } = existencia.val();

    $('#consorcio').html(consorcio);
    $('#fecha').html(fecha);
    $('#coordinadora').html(coordinadora);
    $('#tienda').html(tienda);
    $('#zona').html(zona);

    let filas = '';
    let productos = existencia.val().productos;

    datatable.clear().draw();
    let totalPiezas = 0, kilosTotales = 0;
    for(let producto in productos) {
      filas += `<tr>
                  <td>${productos[producto].nombre}</td>
                  <td>${productos[producto].piezas}</td>
                  <td>${productos[producto].totalKilos}</td>
                  <td><button class="btn btn-xs btn-warning" onclick="editarProducto('${producto}')"><i class="fas fa-pencil-alt"></i></button></td>
                </tr>`;
      totalPiezas += productos[producto].piezas;
      kilosTotales += productos[producto].totalKilos;
    }

    $('#totalPiezas').html(totalPiezas);
    $('#kilosTotales').html(kilosTotales.toFixed(2));

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function editarProducto(claveProducto) {
  let idExistencia = getQueryVariable('id');
  $('#modalEditar').modal('show');
  $('#btnActualizar').attr('onclick', `actualizarProducto('${claveProducto}')`);
  db.ref(`existencias/${idExistencia}/productos/${claveProducto}`).once('value', snapshot => {
    $('#nombreProducto').val(snapshot.val().nombre);
    $('#piezas').val(snapshot.val().piezas);
  });
}

function actualizarProducto(claveProducto) {
  let idExistencia = getQueryVariable('id');
  let consorcio = $('#consorcio').text();
  let piezas = Number($('#piezas').val());
  
  db.ref(`consorcios/${consorcio}/productos/${claveProducto}`).once('value', producto => {
    let empaque = Number(producto.val().empaque);
    let totalKilos = Number((piezas * empaque).toFixed(4));
      
    db.ref(`existencias/${idExistencia}/productos/${claveProducto}`).update({
      piezas,
      totalKilos,
    });
    $('#modalEditar').modal('hide');

    swal({
      type: 'success',
      title: 'Mensaje',
      text: 'La existencia se actualizó con éxito',
    });


  });
}