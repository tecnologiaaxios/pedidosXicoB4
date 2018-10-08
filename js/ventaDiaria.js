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

  mostrarDatosVentaDiaria();
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

function mostrarDatosVentaDiaria() {
  let datatable = $('#tablaProductos').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  let idVentaDiaria = getQueryVariable('id');

  db.ref(`ventasDiarias/${idVentaDiaria}`).on('value', venta => {

    let { consorcio, fecha, promotora, productos, tienda, zona, totalKilos, totalPesos } = venta.val();

    $('#consorcio').html(consorcio);
    $('#fecha').html(fecha);
    $('#promotora').html(nombrePromotora);
    $('#idPromotora').html(idPromotora);
    $('#tienda').html(tienda);
    $('#zona').html(zona);

    let filas = '';

    datatable.clear().draw();
    // let totalKilos = 0, totalPesos = 0;
    for(let producto in productos) {
      filas += `<tr>
                  <td>${producto}</td>
                  <td>${productos[producto].nombre}</td>
                  <td>${productos[producto].kilos}</td>
                  <td>$ ${productos[producto].pesos}</td>
                  <td><button class="btn btn-xs btn-warning" onclick="editarProducto('${producto}')"><i class="fas fa-pencil-alt"></i></button></td>
                </tr>`;
      // totalKilos += productos[producto].kilos;
      // totalPesos += productos[producto].pesos;
    }

    $('#totalKilos').html(`${totalKilos} kg`);
    $('#totalPesos').html(`$ ${totalPesos.toFixed(2)}`);

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function editarProducto(claveProducto) {
  let idVentaDiaria = getQueryVariable('id');
  let consorcio = $('#consorcio').text();
  $('#modalEditar').modal('show');
  $('#btnActualizar').attr('onclick', `actualizarProducto('${claveProducto}')`);
  db.ref(`ventasDiarias/${idVentaDiaria}/productos/${claveProducto}`).once('value', snapshot => {
    $('#nombreProducto').val(snapshot.val().nombre);
    $('#kilos').val(snapshot.val().kilos);
    $('#pesos').val(snapshot.val().pesos);
  });
  db.ref(`consorcios/${consorcio}/productos/${claveProducto}`).once('value', snapshot => {
    $('#precio').val(snapshot.val().precioUnitario);
  });
}

$('#kilos').keyup(() => {
  let kilos = Number($('#kilos').val());
  let precio = Number($('#precio').val());
  let pesos = Number((kilos * precio).toFixed(2));
  $('#pesos').val(pesos);
});

function actualizarProducto(claveProducto) {
  let idVenta = getQueryVariable('id');
  let kilos = Number($('#kilos').val());
  let pesos = Number($('#pesos').val());

  db.ref(`ventasDiarias/${idVenta}/productos/${claveProducto}`).update({
    kilos,
    pesos
  });
  $('#modalEditar').modal('hide');

  swal({
    type: 'success',
    title: 'Mensaje',
    text: 'La existencia se actualizó con éxito',
  });
}