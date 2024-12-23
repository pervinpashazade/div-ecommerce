import { Router } from "express"
import { AdminController } from "../controllers/admin.controller.js"
import {  roleCheck, useAuth,  } from "../middlewares/auth.middleware.js"

export const adminRoutes = Router()
const contoller = AdminController()

// -> /api/admin/create
adminRoutes.post("/create", useAuth, roleCheck(['super-admin']),  contoller.adminCreate)
adminRoutes.put("/edit/:id", useAuth, roleCheck(['super-admin']),  contoller.adminEdit)
adminRoutes.put("/change-role/:id", useAuth, roleCheck(['super-admin']),  contoller.adminRole)
adminRoutes.delete("/delete/:id", useAuth, roleCheck(['super-admin']),  contoller.adminDelete)
adminRoutes.get("/list", useAuth, roleCheck(['super-admin']), contoller.adminList)
