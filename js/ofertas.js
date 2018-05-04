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

  // llenarSelectZona();
  llenarSelectConsorcio();
  // llenarSelectTienda();
  llenarSelectProducto();
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

function llenarSelectZona() {
  db.ref('regiones').once('value', regiones => {
    let zonas = regiones.val();

    let options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (let zona in zonas) {
      options += `<option value="${zona}">${zona}</option>`;
    }

    $('#zona').html(options);
  });
}

function llenarSelectConsorcio() {
  db.ref('productos').once('value', productos => {
    let consorcios = productos.val();

    let options = `<option selected disabled value="Seleccionar">Seleccionar</option>`;
    for(let consorcio in consorcios) {
      options += `<option value="${consorcio}">${consorcio}</option>`;
    }

    $('#consorcio').html(options);
  })
}

/* $('#consorcio').change(function() {
  let consorcio = $(this).val();
  llenarSelectTienda(consorcio);
}); */

function llenarSelectTienda(consorcio) {
  db.ref('tiendas').orderByChild('consorcio').equalTo(consorcio).once('value', snapshot => {
    let tiendas = snapshot.val();

    let options = `<option selected disabled value="Seleccionar">Seleccionar</option>`;
    for(let tienda in tiendas) {
      // let tiendas = tiendas[tienda];
      let nombreTienda = tiendas[tienda].nombre
      options += `<option value="${nombreTienda}">${nombreTienda}</option>`;

      /* for(let tienda in tiendas) {
      } */
    }
    $('#tienda').html(options);
  });
}

function llenarSelectProducto() {
  db.ref('listadoProductos').once('value', snapshot => {
    let productos = snapshot.val();
    let options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for(let producto in productos) {
      options += `<option value="${producto}">${producto}</option>`;
    }

    $('#producto').html(options);
  })
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

// todas las que no sean division que sean tiendas
// por ejemplo hiper y super (soriana)
// poner el tipo de clasificacion

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
    fechaInicioFormateada() {
      let fecha = this.fechaInicio.split('-');
      return `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
    },
    fechaFinFormateada() {
      let fecha = this.fechaFin.split('-');
      return `${fecha[2]}/${fecha[1]}/${fecha[0]}`;
    }
  },
  firebase: {
    ofertas: db.ref('ofertas'),
    tiendas: db.ref('tiendas')
  },
  methods: {
    llenarSelectTienda() {
      let options = `<option selected disabled value="Seleccionar">Seleccionar</option>`;
      this.tiendas.forEach(tienda => {
        if(tienda.consorcio == this.consorcio) {
          options += `<option value="${tienda.nombre}">${tienda.nombre}</option>`;
        }
      });
      $('#tienda').html(options);
    },
    /* llenarSelectTienda() {
      db.ref('tiendas').orderByChild('consorcio').equalTo(this.consorcio).once('value', snapshot => {
        let tiendas = snapshot.val();
    
        let options = `<option selected disabled value="Seleccionar">Seleccionar</option>`;
        for(let tienda in tiendas) {
          let nombreTienda = tiendas[tienda].nombre
          options += `<option value="${nombreTienda}">${nombreTienda}</option>`;
        }
        $('#tienda').html(options);
      });
    }, */
    limpiarCampos() {
      this.producto = "Seleccionar",
      this.precioOferta = 0,
      this.fechaInicio = "",
      this.fechaFin = ""
    },
    agregarProducto() {
      if(this.producto != 'Seleccionar' && this.precioOferta > 0 && this.fechaInicio != '' && this.fechaFin != '') {
        db.ref('listadoProductos').child(this.producto).once('value', snapshot => {
          let datos = snapshot.val();

          let producto = {
            clave: this.producto,
            nombre: datos.nombre,
            precioLista: datos.precioUnitario,
            precioOferta: Number(this.precioOferta),
            fechaInicio: this.fechaInicioFormateada,
            fechaFin: this.fechaFinFormateada
          }
          this.productos.push(producto);
          this.limpiarCampos();
        });
      }
    },
    guardarOferta() {
      if(this.consorcio != "Seleccionar" && this.productos.length > 0) {
        swal({
          title: "¿Está seguro de crear esta oferta?",
          text: "",
          icon: "info",
          buttons: true,
          confirm: true,
        })
        .then((will) => {
          if (will) {
            db.ref('ofertas').once('value', snapshot => {
              let ofertas = snapshot.val();
              if(ofertas != undefined) {
                let keys = Object.keys(ofertas),
                last = keys[keys.length - 1],
                ultimaOferta = ofertas[last],
                lastclave = ultimaOferta.clave,
                clave = lastclave + 1;
                
                if(this.tienda == "Seleccionar") {
                  db.ref('ofertas').push({
                    activa: true,
                    clave,
                    /* zona: this.zona, */
                    consorcio: this.consorcio,
                    tienda: '',
                    productos: this.productos   
                  });
                }
                else {
                  db.ref('ofertas').push({
                    activa: true,
                    clave,
                    /* zona: this.zona, */
                    consorcio: this.consorcio,
                    tienda: this.tienda,
                    productos: this.productos
                  });
                }
              }
              else {
                if(this.tienda == "Seleccionar") {
                  db.ref('ofertas').push({
                    clave: 1,
                    /* zona: this.zona, */
                    consorcio: this.consorcio,
                    tienda: '',
                    productos: this.productos
                  });
                }
                else {
                  db.ref('ofertas').push({
                    clave: 1,
                    /* zona: this.zona, */
                    consorcio: this.consorcio,
                    tienda: this.tienda,
                    productos: this.productos
                  });
                }
              }
            
              this.consorcio = "Seleccionar";
              this.tienda = "Seleccionar",
              this.productos = [];
              this.limpiarCampos();
            }); 
            
            swal("La oferta se ha dado de alta", {
              icon: "success",
            });
          }
        });
      } 

      /* if(this.zona != "Seleccionar" && this.consorcio != "Seleccionar" && this.tienda != "Seleccionar" && this.productos.length > 0) {
        
      } */
      
    }
  }
});

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