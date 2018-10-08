const db = firebase.database();
const auth = firebase.auth();
let productos = [];

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
    //si hay un usuario
    if (user) {
      mostrarContador();
    }
    else {
      $(location).attr("href", "index.html");
    }
  });
}

function llenarConsorcios() {
  
}

$('#consorcio').change(function() {
  
});

function mostrarProductos() {
  db.ref(`consorcios`).on('value', (snapshot) => {
    let consorcios = snapshot.val();
    
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
  computed: {
    
  },
  firebase: {
    consorcios: db.ref('consorcios')
  },
  methods: {
    limpiarCampos() {
      this.activo = true;
      this.clave = '';
      this.claveConsorcio = '';
      this.empaque = 0;
      this.nombre = '';
      this.precioUnitario = 0;
      this.unidad = '';
      this.consorcio = '';
    },
    guardarProducto() {
      if(this.clave != '' && this.claveConsorcio != '' && this.empaque > 0 && this.nombre != '' && this.precioUnitario > 0 && unidad != '') {
        let producto = {
          activo: this.activo,
          clave: this.clave,
          claveConsorcio: this.claveConsorcio,
          empaque: this.empaque,
          nombre: this.nombre,
          precioUnitario: this.precioUnitario,
          unidad: this.unidad
        }

        db.ref(`productos/${this.consorcio}`).once('value', (snapshot) => {
          if(snapshot.val() == null) {
            db.ref(`consorcios/${this.consorcio}/productos/${this.clave}`).set(producto);
            db.ref(`productos/${this.consorcio}/${this.clave}`).set(producto);

            $('#modalAgregarProducto').modal('hide');
            swal({
              icon: 'success',
              text: 'El producto se ingresó'
            });
            this.limpiarCampos()
          }
          else {
            let listaProductos = Object.keys(snapshot.val());
            if(listaProductos.includes(this.clave)) {
              $('#modalAgregarProducto').modal('hide');
              swal({
                icon: 'error',
                text: 'Ya hay un producto con esa clave'
              });
              this.limpiarCampos();
            }
            else {
              db.ref(`consorcios/${this.consorcio}/productos/${this.clave}`).set(producto);
              db.ref(`productos/${this.consorcio}/${this.clave}`).set(producto);

              $('#modalAgregarProducto').modal('hide');
              swal({
                icon: 'success',
                text: 'El producto se ingresó'
              });
              this.limpiarCampos()
            }
          }
        })
      }    
    },
    abrirModalEditar(claveProducto) {
      db.ref(`consorcios/${this.consorcioFiltrar}/productos/${claveProducto}`).once('value', producto => {
        let datos = producto.val();

        this.nombre = datos.nombre;
        this.clave = producto.key;
        this.claveConsorcio = datos.claveConsorcio;
        this.precioUnitario = datos.precioUnitario;
        this.empaque = datos.empaque;
        this.consorcio = this.consorcioFiltrar;
        this.unidad = datos.unidad;
        this.activoEditar = datos.activo
      });
    },
    filtrarProductos() {
      this.consorcios.forEach(consorcio => {
        if(consorcio['.key'] == this.consorcioFiltrar) {
          this.productos = consorcio.productos;
        }
      });
    },
    estado(activo) {
      return (activo) ? `<span class="badge badge-success">Activo</span>` : `<span class="badge badge-secondary">Inactivo</span>`
    }
  }
});

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

function mostrarContador() {
  let uid = auth.currentUser.uid;
  let notificacionesRef = db.ref(`notificaciones/almacen/${uid}`);
  notificacionesRef.on('value', function (snapshot) {
    let cont = snapshot.val().cont;

    if (cont > 0) {
      $('#spanNotificaciones').html(cont).show();
    }
    else {
      $('#spanNotificaciones').hide();
    }
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