import { Router } from "express"
import { AdminController } from "../controllers/admin.controller.js"
import {  idCheck, roleCheck, useAuth,  } from "../middlewares/auth.middleware.js"

export const adminRoutes = Router()
const contoller = AdminController()

// -> /api/admin/create
adminRoutes.post("/create", useAuth, roleCheck(['super-admin']),  contoller.userCreate)
adminRoutes.put("/edit/:id", useAuth, roleCheck(['super-admin']), idCheck,  contoller.userEdit)
adminRoutes.delete("/delete/:id", useAuth, roleCheck(['super-admin']),idCheck,  contoller.userDelete)
adminRoutes.get("/list", useAuth, roleCheck(['super-admin']), contoller.adminList)
adminRoutes.get('/users/list', useAuth, roleCheck(['super-admin']), contoller.userList)