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

  mostrarExistencias();
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

function mostrarExistencias() {
  let datatable = $('#tablaExistencias').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  db.ref('existencias').on('value', existencias => {
    let filas = '';
    let arrExistencias = [];
    existencias.forEach(existencia => {
      arrExistencias.unshift({
        id: existencia.key,
        ...existencia.val(),
      });
    });

    datatable.clear().draw();
    arrExistencias.forEach(existencia => {
      filas += `<tr>
                  <td>${existencia.consorcio}</td>
                  <td>${existencia.coordinadora}</td>
                  <td>${existencia.fecha}</td>
                  <td>${existencia.tienda}</td>
                  <td>${existencia.zona}</td>
                  <td class="text-center"><a class="btn btn-xs btn-primary" href="existencia.html?id=${existencia.id}"><i class="fas fa-eye"></i></a></td>
                  <td class="text-center"><button class="btn btn-xs btn-danger" onclick="eliminarExistencia('${existencia.id}')"><i class="fas fa-trash-alt"></i></button></td>
                </tr>`;
    });
    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function eliminarExistencia(idExistencia) {
  swal({
    title: 'Advertencia',
    text: `¿Está seguro de eliminar esta existencia?`,
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#aaa',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Eliminar',
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      db.ref('existencias').child(idExistencia).remove();
 
      swal({
        type: 'success',
        title: 'Mensaje',
        text: 'Se ha eliminado la existencia',
      });
    }
  });
}