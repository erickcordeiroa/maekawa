import "server-only"
import { db } from "@/server/db"

export const attendanceRepository = {
  forClassOnDay(classGroupId: number, date: Date) {
    return db.attendance.findMany({ where: { classGroupId, date } })
  },

  findOne(studentId: number, classGroupId: number, date: Date) {
    return db.attendance.findUnique({ where: { studentId_classGroupId_date: { studentId, classGroupId, date } } })
  },

  /** Presenças a partir de uma data, com horário da turma para exibir "Hoje, 19:00" */
  presentSince(from: Date) {
    return db.attendance.findMany({
      where: { present: true, date: { gte: from } },
      select: { studentId: true, date: true, checkedInAt: true, source: true, classGroup: { select: { startTime: true } } },
      orderBy: { date: "desc" },
    })
  },

  /** Grava a chamada: cria ou atualiza a marcação de cada aluno */
  saveRollCall(classGroupId: number, date: Date, marks: { studentId: number; present: boolean }[]) {
    return db.$transaction(
      marks.map(({ studentId, present }) =>
        db.attendance.upsert({
          where: { studentId_classGroupId_date: { studentId, classGroupId, date } },
          create: { studentId, classGroupId, date, present, source: "manual", checkedInAt: present ? new Date() : null },
          update: { present },
        })
      )
    )
  },

  checkIn(studentId: number, classGroupId: number, date: Date, at: Date) {
    return db.attendance.upsert({
      where: { studentId_classGroupId_date: { studentId, classGroupId, date } },
      create: { studentId, classGroupId, date, present: true, source: "qr", checkedInAt: at },
      update: { present: true, source: "qr", checkedInAt: at },
    })
  },
}
