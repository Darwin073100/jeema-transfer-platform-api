--?-----------------------------------------------GO----Insersion de los ROLES de los usuarios---------------------------------------------------------------------
--
-- Inserción de los registros iniciales de roles
--
INSERT INTO "role" ("role_id", "name", "description", "created_at", "updated_at", "deleted_at") VALUES
(1, 'global_admin', 'Administrador con acceso completo al sistema.', DEFAULT, DEFAULT, NULL),
(2, 'establishment_manager', 'Gestiona establecimientos y sucursales.', DEFAULT, DEFAULT, NULL),
(3, 'branch_office_management', 'Gestiona sucursales', DEFAULT, DEFAULT, NULL),
(4, 'cajero', 'Movimientos de caja', DEFAULT, DEFAULT, NULL),
(5, 'seller', 'Vendedor', DEFAULT, DEFAULT, NULL);

--
-- Reajuste de la secuencia (Importante si se insertan IDs explícitos)
--

-- Se ajusta la secuencia de 'role_id' al valor máximo insertado (4) + 1, para que los futuros INSERTs
-- sin especificar ID continúen correctamente.
SELECT setval('role_role_id_seq', (SELECT MAX(role_id) FROM "role"), true);
--?-----------------------------------------------END----Insersion de los ROLES de los usuarios---------------------------------------------------------------------
/*====*/
--?-----------------------------------------------GO----Insersion de los PERMISOS de los usuarios---------------------------------------------------------------------
--
-- Inserción de los registros iniciales de permisos
--

INSERT INTO "permission" ("permission_id", "name", "description", "created_at", "updated_at", "deleted_at") VALUES
(1, 'user:read_all', 'Puede ver todos los usuarios.', DEFAULT, DEFAULT, NULL),
(2, 'user:manage', 'Puede crear, actualizar y eliminar usuarios.', DEFAULT, DEFAULT, NULL),
(3, 'role:manage', 'Puede crear, actualizar y eliminar roles.', DEFAULT, DEFAULT, NULL),
(4, 'permission:manage', 'Puede crear, actualizar y eliminar permisos.', DEFAULT, DEFAULT, NULL),
(5, 'establishment:read', 'Puede ver detalles de establecimientos.', DEFAULT, DEFAULT, NULL),
(6, 'establishment:create', 'Puede crear nuevos establecimientos.', DEFAULT, DEFAULT, NULL),
(7, 'establishment:update', 'Puede actualizar establecimientos.', DEFAULT, DEFAULT, NULL),
(8, 'establishment:delete', 'Puede eliminar establecimientos.', DEFAULT, DEFAULT, NULL),
(9, 'branch:read', 'Puede ver detalles de sucursales.', DEFAULT, DEFAULT, NULL),
(10, 'branch:create', 'Puede crear nuevas sucursales.', DEFAULT, DEFAULT, NULL);

---

--
-- Reajuste de la secuencia (Importante si se insertan IDs explícitos)
--

-- Se ajusta la secuencia de 'permission_id' al valor máximo insertado (10) + 1, para que los futuros INSERTs
-- sin especificar ID continúen correctamente.
SELECT setval('permission_permission_id_seq', (SELECT MAX(permission_id) FROM "permission"), true);
--?-----------------------------------------------END----Insersion de los PERMISOS de los usuarios---------------------------------------------------------------------
/*====*/
--?-----------------------------------------------GO----Insersion de los PERMISOS DE LOS ROLES de los usuarios---------------------------------------------------------------------
--
-- Inserción de los registros de asignación de permisos a roles
--

INSERT INTO "role_permission" ("role_permission_id", "permission_id", "role_id", "created_at", "updated_at", "deleted_at") VALUES
-- Permisos para global_admin (role_id = 1)
(1, 1, 1, DEFAULT, DEFAULT, NULL),
(2, 2, 1, DEFAULT, DEFAULT, NULL),
(3, 3, 1, DEFAULT, DEFAULT, NULL),
(4, 4, 1, DEFAULT, DEFAULT, NULL),
(5, 5, 1, DEFAULT, DEFAULT, NULL),
(6, 6, 1, DEFAULT, DEFAULT, NULL),
(7, 7, 1, DEFAULT, DEFAULT, NULL),
(8, 8, 1, DEFAULT, DEFAULT, NULL),
(9, 9, 1, DEFAULT, DEFAULT, NULL),
(10, 10, 1, DEFAULT, DEFAULT, NULL),

-- Permisos para establishment_manager (role_id = 2)
(11, 5, 2, DEFAULT, DEFAULT, NULL),
(12, 6, 2, DEFAULT, DEFAULT, NULL),
(13, 7, 2, DEFAULT, DEFAULT, NULL),
(14, 9, 2, DEFAULT, DEFAULT, NULL),
(15, 10, 2, DEFAULT, DEFAULT, NULL),

-- Permisos para employee (role_id = 3)
(16, 5, 3, DEFAULT, DEFAULT, NULL),
(17, 9, 3, DEFAULT, DEFAULT, NULL),

-- Permisos para customer (role_id = 4)
(18, 5, 4, DEFAULT, DEFAULT, NULL);

---

--
-- Reajuste de la secuencia
--

-- Se ajusta la secuencia de 'role_permission_id' al valor máximo insertado (18) + 1.
SELECT setval('role_permission_role_permission_id_seq', (SELECT MAX(role_permission_id) FROM "role_permission"), true);
--?-----------------------------------------------END----Insersion de los PERMISOS DE LOS ROLES de los usuarios---------------------------------------------------------------------
/*====*/
--?-----------------------------------------------GO----Insersion de los TIPOS DE TRANSACCIONES para ingresos y egresos---------------------------------------------------------------------
-- 1. Insertar Tipos de Transacción de INGRESO (AccountTypeEnum: 'ingreso')
INSERT INTO transaction_type (name, description, account_type) VALUES
('Ingreso por Venta de Mercancía', 'Ingreso principal generado por la venta de productos o servicios.', 'Ingreso'),
('Devolución de Compra a Proveedor', 'Ingreso de dinero resultante de devolver mercancía a un proveedor (reembolso).', 'Ingreso'),
('Apertura de Caja', 'Ingreso contable para corregir un saldo de caja o cuenta bancaria por error o sobrante.', 'Ingreso'),
('Intereses Ganados', 'Ingreso por intereses bancarios o de inversiones.', 'Ingreso'),
('Venta de Activo Fijo', 'Ingreso por la venta de un activo que la empresa ya no necesita (ej. equipo viejo).', 'Ingreso');

-- 2. Insertar Tipos de Transacción de EGRESO (AccountTypeEnum: 'egreso')
INSERT INTO transaction_type (name, description, account_type) VALUES
('Pago a Proveedor por Compra', 'Egreso para pagar la adquisición de mercancía o materia prima (Inventario).', 'Egreso'),
('Pago de Salario o Nómina', 'Egreso correspondiente al pago de sueldos y prestaciones a empleados.', 'Egreso'),
('Compra de Activo Fijo', 'Egreso para la adquisición de bienes de larga duración (ej. maquinaria, vehículos).', 'Egreso'),
('Pago de Renta o Alquiler', 'Egreso por el pago de la renta del local u oficinas.', 'Egreso'),
('Pago de Servicios (Luz, Agua, Internet)', 'Egreso por el pago de servicios básicos u operativos.', 'Egreso'),
('Devolución por Venta al Cliente', 'Egreso de dinero al cliente debido a una devolución de mercancía.', 'Egreso'),
('Gasto por Flete o Transporte', 'Egreso asociado al costo de envío de mercancía (compra o venta).', 'Egreso'),
('Retiro de efectivo/Corte de caja', 'Egreso de dinero, el mismo con el que se apertura caja es el que egresa.', 'Egreso'),
('Retiro de Efectivo/Caja Chica', 'Egreso de efectivo para uso operativo o fondo fijo.', 'Egreso');

INSERT INTO transaction_type (name, description, account_type) VALUES
('Ingreso por Sobrante en caja', 'Ingreso por algun sobrante al hacer corte de caja.', 'Ingreso');
--?-----------------------------------------------END----Insersion de los TIPOS DE TRANSACCIONES para ingresos y egresos---------------------------------------------------------------------
/*====*/
--?-----------------------------------------------GO----Insersion de los METODOS DE PAGO de los usuarios---------------------------------------------------------------------
INSERT INTO employee_role ("name") VALUES
('Gerente'),
('Encargado'),
('Vendedor'),
('Cajero');
--?-----------------------------------------------END----Insersion de los METODOS DE PAGOS de los usuarios---------------------------------------------------------------------
--?-----------------------------------------------GO----Insersion de los METODOS DE PAGO de los usuarios---------------------------------------------------------------------
INSERT INTO payment_method ("name", requires_reference) VALUES
('Efectivo', false),
('Transferencia', true);
--?-----------------------------------------------END----Insersion de los METODOS DE PAGOS de los usuarios---------------------------------------------------------------------