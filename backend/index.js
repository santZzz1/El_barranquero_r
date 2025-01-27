const mysql = require('mysql');
const cors = require('cors');
const express = require('express');
const app = express()

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'el_barranquero'
}
)

//PAGINA DEL MENU

app.get("/menu", (req, res) => {
    db.query('SELECT * from menu',
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
})

//PAGINA DEL EDITAR MENU

app.get("/editarMenu", (req, res) => {
    db.query('SELECT * from menu',
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
})

app.put("/editarMenu/update", (req, res) => {
    const id = req.body.id_plato;
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const precio = req.body.precio;
    const imagen = req.body.imagen;
    const categoria = req.body.categoria;
    const dia = req.body.dia;

    db.query('UPDATE menu SET nombre=?,descripcion=?,ingredientes=?,precio=?,categoria=?,dia=?,imagen=? WHERE id_plato=?', [nombre, descripcion, ingredientes, precio, categoria, dia, imagen, id],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

app.delete("/editarMenu/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query(`DELETE FROM menu WHERE id_plato=?;`, [id],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

app.post("/editarMenu/create", (req, res) => {
    const nombre = req.body.nombre;
    const descripcion = req.body.descripcion;
    const ingredientes = req.body.ingredientes;
    const precio = req.body.precio;
    const imagen = req.body.imagen;
    const categoria = req.body.categoria;
    const dia = req.body.dia;

    db.query('INSERT INTO menu(nombre,descripcion,ingredientes,precio,categoria,dia,imagen) VALUES (?,?,?,?,?,?,?)', [nombre, descripcion, ingredientes, precio, categoria, dia, imagen],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

//PÁGINA DE COMPRA

app.post("/datosCliente/createCliente", (req, res) => {
    const cedula = parseInt(req.body.cedula)
    const nombre = req.body.nombre
    const direccion = req.body.direccion
    const telefono = req.body.telefono
    const correo_electronico = req.body.correo_electronico

    // Verificar si la cédula ya existe en la base de datos
    const consulta = 'SELECT * FROM cliente WHERE cedula = ?';
    db.query(consulta, [cedula], (err, results) => {
        if (err) {
            console.log(err)
        } else if (results.length > 0) {
            // La cédula ya existe, actualiza los datos del cliente
            const actualizacion = 'UPDATE cliente SET nombre = ?, direccion = ?, telefono = ?, correo_electronico = ? WHERE cedula = ?';
            db.query(actualizacion, [nombre, direccion, telefono, correo_electronico, cedula], err => {
                if (err) {
                    res.status(500).json({ error: 'Error al actualizar el cliente' });
                } else {
                    res.status(200).json({ mensaje: 'Cliente actualizado con éxito' });
                }
            });
        } else {
            // La cédula no existe, crea un nuevo registro
            const nuevoCliente = 'INSERT INTO cliente (cedula, nombre, direccion, telefono, correo_electronico) VALUES (?, ?, ?, ?, ?)';
            db.query(nuevoCliente, [cedula, nombre, direccion, telefono, correo_electronico], err => {
                if (err) {
                    console.log(err)
                } else {
                    res.status(200).json({ mensaje: 'Cliente creado con éxito' });
                }
            });
        }
    });
})

app.post("/datosCliente/createPedido", (req, res) => {
    const cedula = parseInt(req.body.cedula)
    const metodo = req.body.metodo
    const total = req.body.total
    const lista = req.body.lista

    db.query('INSERT INTO pedido(cedula_cliente,metodo,total,id_platos) VALUES (?,?,?,?)', [cedula, metodo, total, lista],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
                console.log('pedido enviado')
            }
        }
    )
})

app.post("/pedidos/createReserva", (req, res) => {
    const cedula = parseInt(req.body.cedula)
    const fecha = req.body.fecha
    const hora = req.body.hora
    const personas = req.body.personas

    db.query('INSERT INTO reservas(cedula_cliente,fecha,hora,num_personas) VALUES (?,?,?,?)', [cedula, fecha, hora, personas],
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                res.send(result)
                console.log('reserva guardada')
            }
        })
})

// PÁGINA ADMIN

app.get("/admin/pedido", (req, res) => {
    db.query('SELECT * FROM pedido WHERE metodo = "recoge" ORDER BY id_pedido LIMIT 1;',
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                res.send(result)
            }
        })
})

app.delete("/admin/pedido/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query(`DELETE FROM pedido WHERE id_pedido=?;`, [id],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

app.get("/admin/domicilio", (req, res) => {
    db.query('SELECT pedido.*, cliente.direccion FROM pedido INNER JOIN cliente ON pedido.cedula_cliente = cliente.cedula WHERE metodo = "domicilio" ORDER BY id_pedido LIMIT 1;',
        (err, result) => {
            if (err) {
                console.log(err)
            } else {
                res.send(result)
            }
        })
})

app.delete("/admin/domicilio/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query(`DELETE FROM pedido WHERE id_pedido=?;`, [id],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

app.get("/admin/contabilidad", (req, res) => {
    db.query('SELECT * from contabilidad',
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        })
})

app.put("/admin/updateIng", (req, res) => {
    const ingresos = req.body.ingresos;

    db.query('UPDATE contabilidad SET ingresos = ingresos + ?', [ingresos],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

app.put("/admin/deleteIng", (req, res) => {

    db.query('UPDATE contabilidad SET ingresos = ?', [0],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

app.put("/admin/updateEgr", (req, res) => {
    const egresos = req.body.egresos;

    db.query('UPDATE contabilidad SET egresos = egresos + ?', [egresos],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
                console.log('cambio')
            }
        }
    )
});

app.put("/admin/deleteEgr", (req, res) => {

    db.query('UPDATE contabilidad SET egresos = ?', [0],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    )
});

app.listen(3001, () => {
    console.log("Server is running on port 3001")
})