# TODO - Implementación Notificaciones Admin

## ✅ Paso 1: Helpers creados
- [x] src/lib/notifications.ts (createAdminNotifications + createNotificationToUser)

## ✅ Completado
- [x] Paso 1: src/lib/notifications.ts
- [x] Paso 2: auxiliar/convocatorias/actions.ts
- [x] Paso 3: profesor/convocatorias/actions.ts
- [x] Paso 4: aliado/actions.ts 
- [x] Paso 5: estudiante/mis-horas/reportar/actions.ts

## 🧪 Tests (ejecutar manualmente):
```
1. ✅ Auxiliar → Nueva convocatoria → Admin "1 Nueva"
2. ✅ Profesor → Nueva convocatoria → Admin "1 Nueva" 
3. ✅ Aliado → Nueva convocatoria → Admin "1 Nueva"
4. ✅ Estudiante → Reportar horas → Creador actividad + Admin notif
```
**Verificar:** npx prisma studio → tabla notificaciones

**Listo para testing!** 🎉

## Tests Pendientes
- [ ] Test 1: Auxiliar crea convocatoria → Admin "1 Nueva"
- [ ] Test 2: Estudiante postula → Publicador notif
- [ ] Test 3: Estudiante reporta horas → Creador actividad notif
- [ ] Test 4: Panel Admin badge actualizado

**Comando test:** npx prisma studio → Verificar tabla notificaciones

