import middleware from './middleware';
import controller from './controller';
import express from 'express';
const router = express.Router();

                               // check auth user =>     check user is admin     =>   check form values  =>  controller
router.post('/database/:database',middleware.auth, middleware.permission(['admin', 'superadmin']), middleware.database, controller.create);
router.put('/database/:database',middleware.auth, middleware.permission(['admin', 'superadmin']), middleware.database, controller.update);
router.delete('/database/:database',middleware.auth, middleware.permission(['admin', 'superadmin']), middleware.database, controller.remove);

router.get('/ticket', middleware.auth, middleware.permission(['user']), controller.ticket.getUserTickets);
router.post('/ticket', middleware.auth, middleware.permission(['user']), controller.ticket.createUserTicket);
router.get('/ticket/status/:status', middleware.auth, middleware.permission(['admin', 'superadmin']), controller.ticket.getAllTicketsByStatusForAdmin);
router.get('/ticket/message/:ticket', middleware.auth, controller.ticket.getAllTicketMessages);
router.post('/ticket/message/:ticket', middleware.auth, controller.ticket.addTicketMessage);
router.post('/ticket/close/:ticket', middleware.auth, controller.ticket.closeTicket);

router.post('/bug', middleware.auth, middleware.permission(['user']), controller.bug.sendBug); // send new bug report by user
router.get('/bug', middleware.auth, controller.bug.getBugs); // get list of bugs

export default router;