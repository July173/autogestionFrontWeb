lo que revcibe el backen en el enpoint del swagger 
aprendiz_id*	integer
title: Aprendiz id
ID del aprendiz

ficha_id*	integer
title: Ficha id
ID de la ficha

fecha_inicio_contrato*	string($date)
title: Fecha inicio contrato
Fecha de inicio de contrato de aprendizaje

fecha_fin_contrato*	string($date)
title: Fecha fin contrato
Fecha de fin de contrato de aprendizaje

enterprise_name*	string
title: Enterprise name
maxLength: 100
minLength: 1
Nombre de la empresa

enterprise_nit*	integer
title: Enterprise nit
NIT de la empresa (solo números)

enterprise_location*	string
title: Enterprise location
maxLength: 255
minLength: 1
Ubicación de la empresa

enterprise_email*	string($email)
title: Enterprise email
minLength: 1
Correo electrónico de la empresa

boss_name*	string
title: Boss name
maxLength: 100
minLength: 1
Nombre del jefe inmediato

boss_phone*	integer
title: Boss phone
Teléfono del jefe (solo números)

boss_email*	string($email)
title: Boss email
minLength: 1
Correo del jefe inmediato

boss_position*	string
title: Boss position
maxLength: 100
minLength: 1
Cargo del jefe inmediato

human_talent_name*	string
title: Human talent name
maxLength: 100
minLength: 1
Nombre del responsable de talento humano

human_talent_email*	string($email)
title: Human talent email
minLength: 1
Correo de talento humano

human_talent_phone*	integer
title: Human talent phone
Teléfono de talento humano (solo números)

sede*	integer
title: Sede
ID de la sede

modality_productive_stage*	integer
title: Modality productive stage
ID de la modalidad de etapa productiva

lo que esta enviando el front al enpoint

{
    "success": false,
    "message": "Error en los datos de entrada",
    "errors": {
        "aprendiz_id": [
            "Este campo es requerido."
        ],
        "ficha_id": [
            "Este campo es requerido."
        ],
        "fecha_inicio_contrato": [
            "Este campo es requerido."
        ],
        "fecha_fin_contrato": [
            "Este campo es requerido."
        ],
        "enterprise_name": [
            "Este campo es requerido."
        ],
        "enterprise_nit": [
            "Este campo es requerido."
        ],
        "enterprise_location": [
            "Este campo es requerido."
        ],
        "enterprise_email": [
            "Este campo es requerido."
        ],
        "boss_name": [
            "Este campo es requerido."
        ],
        "boss_phone": [
            "Este campo es requerido."
        ],
        "boss_email": [
            "Este campo es requerido."
        ],
        "boss_position": [
            "Este campo es requerido."
        ],
        "human_talent_name": [
            "Este campo es requerido."
        ],
        "human_talent_email": [
            "Este campo es requerido."
        ],
        "human_talent_phone": [
            "Este campo es requerido."
        ],
        "modality_productive_stage": [
            "Este campo es requerido."
        ]
    }
}