const db = firebase.database();
const auth = firebase.auth();
let productos = [], productosComprobar = [];

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

  $('#formatos').multiselect({
    buttonClass: 'form-control',
    nonSelectedText: 'Seleccionar',
    buttonContainer: '<div class="btn-group" />',
    buttonWidth: '100%'
  });

  $('#tiendas').multiselect({
    buttonClass: 'form-control',
    nonSelectedText: 'Seleccionar',
    buttonContainer: '<div class="btn-group" />',
    buttonWidth: '100%'
  });

  llenarSelectConsorcio();
  mostrarOfertasActivas();
  mostrarOfertasInactivas();
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

/* function llenarSelectZona() {
  db.ref('regiones').once('value', regiones => {
    let zonas = regiones.val();

    let options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
    for (let zona in zonas) {
      options += `<option value="${zona}">${zona}</option>`;
    }

    $('#zona').html(options);
  });
} */

function llenarSelectConsorcio() {
  db.ref('consorcios').once('value', productos => {
    let consorcios = productos.val();
    // $('#consorcio').multiselect('destroy');
    let options = `<option selected disabled value="Seleccionar">Seleccionar</option>`;
    /* let options = ""; */
    for(let consorcio in consorcios) {
      options += `<option value="${consorcio}">${consorcio}</option>`;
    }

    $('#consorcio').html(options);
    /* $('#consorcio').multiselect({
      buttonClass: 'form-control',
      includeSelectAllOption: true,
      buttonContainer: '<div class="btn-group" />',
      inheritClass: true,
      selectAllText: 'Seleccionar todo',
      nonSelectedText: 'Seleccionar',
      buttonWidth: '100%', 
    }); */
  })
}

$('#consorcio').change(function() {
  let consorcio = $(this).val();
  llenarSelectFormatos(consorcio);
  llenarSelectProducto(consorcio);
});

function llenarSelectFormatos(consorcio) {
  if(consorcio != null && consorcio != undefined) {
    db.ref(`consorcios/${consorcio}/`).once('value', snapshot => {
      let formatos = snapshot.val().formatos;
      if(formatos.length > 0) {
        let options = ``;
        $('#formatos').multiselect('destroy');
        for(let formato of formatos) {
          options += `<option value="${formato}">${formato}</option>`;
        }
        $('#formatos').html(options);
        
        $('#formatos').multiselect({
          buttonClass: 'form-control',
          includeSelectAllOption: true,
          buttonContainer: '<div class="btn-group" />',
          inheritClass: true,
          selectAllText: 'Seleccionar todo',
          nonSelectedText: 'Seleccionar',
          buttonWidth: '100%', 
        });
      }
      else {
        $('#formatos').multiselect('destroy').html('');
        $('#formatos').multiselect({
          buttonClass: 'form-control',
          includeSelectAllOption: true,
          buttonContainer: '<div class="btn-group" />',
          inheritClass: true,
          selectAllText: 'Seleccionar todo',
          nonSelectedText: 'Seleccionar',
          buttonWidth: '100%', 
        });
        llenarSelectTiendas(formatos);
      } 
    });
  }
}

$('#formatos').change(function() {
  let formatos = $(this).val();
  llenarSelectTiendas(formatos)
})

function llenarSelectTiendas(formatos) {
  let consorcio = $('#consorcio').val();
  if(consorcio != null && consorcio != undefined && formatos.length > 0) {
    db.ref(`consorcios/${consorcio}/tiendas`).once('value', snapshot => {
      let tiendas = snapshot.val();
      let options = ``;

      $('#tiendas').multiselect('destroy');
      for(let tienda in tiendas) {
        if(formatos.includes(tiendas[tienda].formato)) {
          let nombreTienda = tiendas[tienda].nombre
          options += `<option value="${nombreTienda}">${nombreTienda}</option>`;
        }
      }
      $('#tiendas').html(options);

      $('#tiendas').multiselect({
        buttonClass: 'form-control',
        includeSelectAllOption: true,
        buttonContainer: '<div class="btn-group" />',
        inheritClass: true,
        selectAllText: 'Seleccionar todo',
        nonSelectedText: 'Seleccionar',
        buttonWidth: '100%', 
      });
    });
  }
  else if(consorcio != null && consorcio != undefined) {
    db.ref(`consorcios/${consorcio}/tiendas`).once('value', snapshot => {
      let tiendas = snapshot.val();
      let options = ``;

      $('#tiendas').multiselect('destroy');
      for(let tienda in tiendas) {
        let nombreTienda = tiendas[tienda].nombre
        options += `<option value="${nombreTienda}">${nombreTienda}</option>`;
      }
      $('#tiendas').html(options);

      $('#tiendas').multiselect({
        buttonClass: 'form-control',
        includeSelectAllOption: true,
        buttonContainer: '<div class="btn-group" />',
        inheritClass: true,
        selectAllText: 'Seleccionar todo',
        nonSelectedText: 'Seleccionar',
        buttonWidth: '100%',
        selectedClass: 'multiselect-selected'
      });
    });
  }
}

/* function llenarSelectTienda(consorcio) {
  db.ref('tiendas').orderByChild('consorcio').equalTo(consorcio).once('value', snapshot => {
    let tiendas = snapshot.val();

    let options = `<option selected disabled value="Seleccionar">Seleccionar</option>`;
    for(let tienda in tiendas) {
      let nombreTienda = tiendas[tienda].nombre
      options += `<option value="${nombreTienda}">${nombreTienda}</option>`;
    }
    $('#tienda').html(options);
  });
} */

/* Vue.use(VueFire);

new Vue({
  el: '#app',
  data: {
    consorcio: 'Seleccionar',
    formatos: [],
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
    consorcios: db.ref('consorcios')
  },
  methods: {
    llenarSelectFormatos() {
      db.ref(`consorcios/${this.consorcio}/`).once('value', snapshot => {
        let formatos = snapshot.val().formatos;
        let options = ``;
    
        $('#formatos').multiselect('destroy');
        for(let formato of formatos) {
          options += `<option value="${formato}">${formato}</option>`;
        }
        $('#formatos').html(options);
        
        $('#formatos').multiselect({
          buttonClass: 'form-control',
          includeSelectAllOption: true,
          buttonContainer: '<div class="btn-group" />',
          inheritClass: true,
          selectAllText: 'Seleccionar todo',
          nonSelectedText: 'Seleccionar',
          buttonWidth: '100%',
          
        });
      });
    },
    llenarSelectTiendas() {
      db.ref(`consorcios/${this.consorcio}/tiendas`).once('value', snapshot => {
        let tiendas = snapshot.val();
        
        console.log("Entro al metodo")
        let options = ``;
        for(let tienda in tiendas) {
          if(this.formatos.includes(tiendas[tienda].formato)) {
            let nombreTienda = tiendas[tienda].nombre

            console.log("El formato esta dentro")
            options += `<option value="${nombreTienda}">${nombreTienda}</option>`;
          }
        }
        
        $('#tienda').html(options);
        $('#tiendas').multiselect({
          buttonClass: 'form-control',
          includeSelectAllOption: true,
          buttonContainer: '<div class="btn-group" />',
          inheritClass: true,
          selectAllText: 'Seleccionar todo',
          nonSelectedText: 'Seleccionar',
          buttonWidth: '100%',
          
        });
      });
    },
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
                    consorcio: this.consorcio,
                    tienda: '',
                    productos: this.productos   
                  });
                }
                else {
                  db.ref('ofertas').push({
                    activa: true,
                    clave,
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
                    consorcio: this.consorcio,
                    tienda: '',
                    productos: this.productos
                  });
                }
                else {
                  db.ref('ofertas').push({
                    clave: 1,
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
    }
  }
}); */

function llenarSelectProducto(consorcio) {
  if(consorcio != null && consorcio != undefined) {
    db.ref(`consorcios/${consorcio}/productos`).once('value', snapshot => {
      let productos = snapshot.val();
      let options = '<option selected disabled value="Seleccionar">Seleccionar</option>';
      for(let producto in productos) {
        options += `<option value="${producto}">${producto} - ${productos[producto].nombre}</option>`;
      }
  
      $('#producto').html(options);
      /* $('#producto').multiselect({
        buttonClass: 'form-control',
        includeSelectAllOption: true,
        buttonContainer: '<div class="btn-group" />',
        inheritClass: true,
        selectAllText: 'Seleccionar todo',
        nonSelectedText: 'Seleccionar',
        buttonWidth: '100%', 
      }); */
    })
  } 
}

function agregarProducto() {
  let consorcio = $('#consorcio').val(),
      claveProducto = $('#producto').val(),
      precioOferta = $('#precioOferta').val();
      
  if(consorcio != undefined && consorcio != null && claveProducto != 'Seleccionar' && claveProducto != null && claveProducto != undefined && precioOferta > 0) {
    db.ref(`consorcios/${consorcio}/productos`).child(claveProducto).once('value', snapshot => {
      let datos = snapshot.val();

      if(productosComprobar.includes(claveProducto)) {
        swal("Ese producto ya se ha agregado", {
          icon: "info",
        });
      }
      else {
        let producto = {
          clave: claveProducto,
          nombre: datos.nombre,
          precioLista: datos.precioUnitario,
          precioOferta: Number(precioOferta),
        }
        productos.push(producto);
        productosComprobar.push(claveProducto);
        limpiarCampos();
  
        let fila = `<tr id="fila-${producto.clave}">
                      <td>${producto.clave}</td>
                      <td>${producto.nombre}</td>
                      <td>${producto.precioLista}</td>
                      <td>${producto.precioOferta}</td>
                      <td class="text-center"><button type="button" class="btn btn-danger btn-xs" onclick="removerProducto(${productos.length-1}, '${producto.clave}')"><span class="fas fa-trash-alt"></span></button></td>
                    </tr>`;
        $('#productos tbody').append(fila);
      }
    });
  }
}

function removerProducto(index, clave) {
  console.log(productos)
  productos.splice(index, 1);
  productosComprobar.splice(index, 1);
  $(`#fila-${clave}`).remove();
  console.log(productos)
}

function limpiarCampos() {
  $('#producto').val('Seleccionar');
  $('#precioOferta').val('');
}

function guardarOferta() {
  let consorcio = $('#consorcio').val(),
      formatos = $('#formatos').val(),
      tiendas = $('#tiendas').val(),
      fechaInicio = $('#fechaInicio').val(),
      fechaFin = $('#fechaFin').val();

  if(consorcio != undefined && consorcio != null && tiendas.length > 0 && fechaInicio.length > 0 && fechaFin.length > 0) {
    if(formatos.length == 0) {
      formatos = "";
    }

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
                
            db.ref('ofertas').push({
              activa: true,
              clave,
              consorcio,
              formatos,
              tiendas,
              productos,
              fechaInicio,
              fechaFin
            });
          }
          else {
            db.ref('ofertas').push({
              activa: true,
              clave: 1,
              consorcio,
              formatos,
              tiendas,
              productos,
              fechaInicio,
              fechaFin
            });
          }
               
          $('#consorcio').val('Seleccionar');
          $('option', $('#formatos')).each(function(element) {
            $(this).removeAttr('selected').prop('selected', false);
          });
          $('#formatos').multiselect('refresh');
          $('option', $('#tiendas')).each(function(element) {
            $(this).removeAttr('selected').prop('selected', false);
          });
          $('#tiendas').multiselect('refresh');
          $('#fechaInicio').val('');
          $('#fechaFin').val('');
          productos = [];
          productosComprobar = [];
          $('#productos tbody').html('');
          limpiarCampos();
            
          swal("La oferta se ha dado de alta", {
            icon: "success",
          });
        });
      }
    });
  }
}

function mostrarOfertasActivas() {
  let datatable = $('#tablaOfertasActivas').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  db.ref('ofertas').orderByChild('activa').equalTo(true).on('value', ofertas => {
    
    let filas = "";
    let arrOfertas = [];
    ofertas.forEach(oferta => {
      arrOfertas.unshift({
        key: oferta.key,
        ...oferta.val()
      })
    })

    arrOfertas.forEach(oferta => {
      // let datosOferta = oferta;

      datatable.clear().draw();
      filas += `<tr>
                  <td>${oferta.key}</td>
                  <td>${oferta.clave}</td>
                  <td>${oferta.consorcio}</td>
                  <td>${oferta.tiendas.join(', ')}</td>
                  <td class="text-center"><span class="badge badge-danger lead">${oferta.productos.length}</span></td>
                  <td>${oferta.fechaInicio}</td>
                  <td>${oferta.fechaFin}</td>
                  <td class="text-center"><a href="oferta.html?id=${oferta.key}" role="button" class="card-link btn btn-xs btn-outline-info"><span class="fas fa-eye"></span> Ver oferta</a></td>
                  <td class="text-center"><button type="button" onclick="finalizarOferta('${oferta.key}')" class="btn btn-xs btn-outline-success"><span class="fas fa-hourglass-end"></span> Finalizar</button></td>
                </tr>`;
    });

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function mostrarOfertasInactivas() {
  let datatable = $('#tablaOfertasInactivas').DataTable({
    pageLength: 25,
    lengthMenu: [[25, 30, 40, 50, -1], [25, 30, 40, 50, "Todas"]],
    destroy: true,
    ordering: false,
    language: LANGUAGE
  });

  db.ref('ofertas').orderByChild('activa').equalTo(false).on('value', ofertas => {
    
    let filas = "";
    let arrOfertas = [];
    ofertas.forEach(oferta => {
      arrOfertas.unshift({
        key: oferta.key,
        ...oferta.val()
      })
    })

    arrOfertas.forEach(oferta => {
      // let datosOferta = oferta.val();

      datatable.clear().draw();

      filas += `<tr>
                  <td>${oferta.key}</td>
                  <td>${oferta.clave}</td>
                  <td>${oferta.consorcio}</td>
                  <td>${oferta.tiendas.join(', ')}</td>
                  <td class="text-center"><span class="badge badge-danger lead">${oferta.productos.length}</span></td>
                  <td>${oferta.fechaInicio}</td>
                  <td>${oferta.fechaFin}</td>
                  <td class="text-center"><a href="oferta.html?id=${oferta.key}" role="button" class="card-link btn btn-xs btn-outline-info"><span class="fas fa-eye"></span> Ver oferta</a></td>
                </tr>`;
    });

    datatable.rows.add($(filas)).columns.adjust().draw();
  });
}

function finalizarOferta(idOferta) {
  swal({
    title: "¿Está seguro de finalizar esta oferta?",
    text: "",
    icon: "info",
    buttons: true,
    confirm: true,
  })
  .then((will) => {
    if (will) {
      db.ref(`ofertas/${idOferta}`).update({
        activa: false
      });

      swal("La oferta se ha finalizado", {
        icon: "success",
      });
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