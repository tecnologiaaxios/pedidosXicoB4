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
    startDate: "today",
    language: "es"
  });

  mostrarVentasDiarias();
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

function mostrarVentasDiarias() {
  let datatable = $('#tablaVentasDiarias').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    language: LANGUAGE,
    dom: 'Bfrtip',
    /* buttons: ['excel'], */
    buttons: [
      {
        extend: 'excel',
        className: 'btn btn-success',
        text: '<i class="far fa-file-excel"></i> Excel'
    }],
    scrollY: "500px",
    scrollCollapse: true,
  });

  db.ref('ventasDiarias').on('value', ventasDiarias => {
    let filas = '';
    let ventas = ventasDiarias.val();
    let arrVentasDiarias = [];
    ventasDiarias.forEach(venta => {
      arrVentasDiarias.unshift({
        id: venta.key,
        ...venta.val(),
      });
    });

    arrVentasDiarias.forEach(venta => {
      //console.log(ventas[key])
      //let venta = ventas[key];
      const {id, consorcio, fecha, idPromotora, nombrePromotora, tienda, zona, totalKilos, totalPesos} = venta;

      filas += `<tr>
                  <td>${consorcio}</td>
                  <td>${fecha}</td>
                  <td>${idPromotora}</td>
                  <td>${nombrePromotora}</td>
                  <td>${tienda}</td>
                  <td>${zona}</td>
                  <td>${totalKilos}</td>
                  <td>${totalPesos}</td>
                  <td class="text-center"><a class="btn btn-xs btn-primary" href="ventaDiaria.html?id=${id}"><i class="fas fa-eye"></i></a></td>
                  <td class="text-center"><button class="btn btn-xs btn-danger" onclick="eliminarVentaDiaria('${id}')"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;
    });

    datatable.clear().draw();
    /* arrVentasDiarias.forEach(venta => {
      filas += `<tr>
                  <td>${venta.consorcio}</td>
                  <td>${venta.fecha}</td>
                  <td>${venta.promotora}</td>
                  <td>${venta.tienda}</td>
                  <td>${venta.zona}</td>
                  <td class="text-center"><a class="btn btn-xs btn-primary" href="ventaDiaria.html?id=${venta.id}"><i class="fas fa-eye"></i></a></td>
                  <td class="text-center"><button class="btn btn-xs btn-danger" onclick="eliminarVentaDiaria('${venta.id}')"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;
    }); */
    datatable.rows.add($(filas)).columns.adjust().draw();
    datatable.buttons().container().appendTo( '#example_wrapper .col-md-6:eq(0)' );
    $.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();
  });
}

function eliminarVentaDiaria(idVentaDiaria) {
  swal({
    title: 'Advertencia',
    text: `¿Está seguro de eliminar esta venta?`,
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#aaa',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Eliminar',
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      db.ref('ventasDiarias').child(idVentaDiaria).remove();
 
      swal({
        type: 'success',
        title: 'Mensaje',
        text: 'Se ha eliminado la venta',
      });
    }
  });
}