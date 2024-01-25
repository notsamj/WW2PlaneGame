const FILE_DATA = {
    "plane_data": {
        "spitfire": {
//            "radius": 48,
            "radius": 64,
            "max_speed": 594,
            "health": 12*5,
            "country": "Britain",
            "type": "Fighter"
        },
        "a6m_zero": {
//            "radius": 47,
            "radius": 64,
            "max_speed": 565,
            "health": 13*5,
            "country": "Japan",
            "type": "Fighter"
        },
        "republic_p_47": {
//            "radius": 46,
            "radius": 64,
            "max_speed": 686,
            "health": 12*5,
            "country": "USA",
            "type": "Fighter"
        },
        "me_bf_109": {
//            "radius": 37,
            "radius": 64,
            "max_speed": 634,
            "health": 10*5,
            "country": "Germany",
            "type": "Fighter"
        },
        "kawasaki_ki_45": {
            "radius": 64,
            "max_speed": 540,
            "health": 17*5,
            "country": "Japan",
            "type": "Fighter"
        },
        "p51_mustang": {
            "radius": 64,
            "max_speed": 710,
            "health": 10*5,
            "country": "USA",
            "type": "Fighter"
        },
        "hawker_sea_fury": {
            "radius": 64,
            "max_speed": 740,
            "health": 9*5,
            "country": "Britain",
            "type": "Fighter"
        },
        "me_309": {
            "radius": 64,
            "max_speed": 733,
            "health": 9*5,
            "country": "Germany",
            "type": "Fighter"
        },
        "b24": {
            "radius": 128,
            "max_speed": 467,
            "health": 50*5,
            "country": "USA",
            "type": "Bomber",
            "guns": [
                { // Front gun
                    "x_offset": 224-128,
                    "y_offset": 128-132,
                    "fov_1": 40,
                    "fov_2": 320,
                    "rate_of_fire": 50
                },
                { // Top gun front
                    "x_offset": 149-128,
                    "y_offset": 128-93,
                    "fov_1": 170,
                    "fov_2": 10,
                    "rate_of_fire": 50
                },
                { // Back bottom gun
                    "x_offset": 110-128,
                    "y_offset": 128-130,
                    "fov_1": 260,
                    "fov_2": 175,
                    "rate_of_fire": 50
                },
                { // Top gun back
                    "x_offset": 27-128,
                    "y_offset": 128-89,
                    "fov_1": 190,
                    "fov_2": 10,
                    "rate_of_fire": 50
                }
            ]
        }
    },
    "teams": ["Allies", "Axis"],
    "bullet_data": {
        "speed": 800,
        "picture": "bullet",
        "radius": 2
    },

    "radar": {
        "size": 36,
        "blip_size": 5,
        "border_width": 2,
        "blip_distance": 375
    },

    "background": {
        "ground": {
            "picture": "dirt",
        },
        "above_ground": {
            "picture": "above_ground",
        },
        "sky": {
            "picture": "clouds",
        }
    },
    "constants": {
        "SHOOT_DISTANCE_CONSTANT": 5,
        "CLOSE_TO_GROUND_CONSTANT": 3,
        "CLOSE_CONSTANT": 3,
        "ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT": 20,
        "TURN_TO_ENEMY_CONSTANT": 0.75, // Maybe 0.75 is good?
        "ENEMY_TAKEN_DISTANCE_MULTIPLIER": 5,
        "EVASIVE_TIME_TO_CATCH": 20,
        "EVASIVE_SPEED_DIFF": 4,
        "MIN_ANGLE_TO_ADJUST": 3,
        "MIN_VELOCITY_ASSUMPTION": 0.01,
        "MAX_THROTTLE": 100,
        "FALL_SPEED": 200,
        "SLOW_DOWN_AMOUNT": 0.1,
        "EXPECTED_CANVAS_WIDTH": 1920,
        "EXPECTED_CANVAS_HEIGHT": 927,
        "FRAME_RATE": 60,
        "TICK_RATE": 100, // 100
        "MS_BETWEEN_TICKS": 10, // 10
        "GRAVITY": 9.81,
        "MAX_BULLET_Y_VELOCITY_MULTIPLIER": 2,
        "server_ip": "localhost",
        "server_port": "8080",
        "PLANE_SHOOT_GAP_MS": 100,
        "MAX_BULLETS": 2000,
        "SAVED_TICKS": 500,
        "KEEP_ALIVE_INTERVAL": 5000,
        "TIME_TO_READY_UP": 5000, // 5000
        "MULTIPLAYER_DISABLED": false
    },

    "ai": {
        "max_ticks_on_course": 6000,
        "tick_cd": 500,
        "bias_ranges": {
            "distance_to_enemy": {
                "upper_bound": 50,
                "lower_bound": -50
            },
            "angle_to_enemy": {
                "upper_bound": 2,
                "lower_bound": -2
            },
            "angle_from_ground": {
                "upper_bound": 4,
                "lower_bound": -4
            },
            "enemy_far_away_distance": {
                "upper_bound": 25,
                "lower_bound": -25
            },
            "enemy_behind_angle": {
                "upper_bound": 5,
                "lower_bound": -5
            },
            "enemy_close_distance": {
                "upper_bound": 50,
                "lower_bound": -50
            },
            "max_ticks_on_course": {
                "upper_bound": 200,
                "lower_bound": -100
            },
            "ticks_cooldown": {
                "upper_bound": 300,
                "lower_bound": -100
            },
            "turn_direction": {
                "upper_bound": 5,
                "lower_bound": -5
            },
            "close_to_ground": {
                "upper_bound": 200,
                "lower_bound": -200
            },
            "flip_direction_lb": {
                "upper_bound": 2,
                "lower_bound": -3
            },
            "flip_direction_ub": {
                "upper_bound": 3,
                "lower_bound": -2
            },
            "min_angle_to_adjust": {
                "upper_bound": 5,
                "lower_bound": 0
            },
            "angle_allowance_at_range": {
                "upper_bound": 3,
                "lower_bound": -4
            },
            "enemy_disregard_distance_time_constant": {
                "upper_bound": 0.05,
                "lower_bound": -0.15
            },
            "enemy_taken_distance_multiplier": {
                "upper_bound": 5,
                "lower_bound": 0.95
            },
            "max_shooting_distance": {
                "upper_bound": 200,
                "lower_bound": -200
            },
            "throttle": {
                "upper_bound": 0,
                "lower_bound": -5
            },
            "max_speed": {
                "upper_bound": 20,
                "lower_bound": -30
            },
            "health": {
                "upper_bound": 3,
                "lower_bound": -3
            },
            "rotation_time": {
                "upper_bound": 18,
                "lower_bound": 12
            }
        }
    },

    "dogfight_settings":{
        "ally_spawn_x": 50000,
        "ally_spawn_y": 50000,
        "axis_spawn_x": 70000,
        "axis_spawn_y": 50000,
        "spawn_offset": 5000
    },
    "country_to_alliance": {
        "Britain": "Allies",
        "USA": "Allies",
        "Japan": "Axis",
        "Germany": "Axis"
    },
    "extra_images_to_load": [
        "radar_outline",
        "radar_blip",
        "radar_blip_friendly",
        "bullet",
        "dirt",
        "above_ground",
        "clouds",
        "freecam",
        "explosion"
    ],

    "smoke_images": [
        "smoke_1",
        "smoke_2",
        "smoke_3"
    ],

    "team_to_colour": {
        "Axis": "red",
        "Allies": "green"
    },

    "sound_data": {
        "sounds": [
            "shoot",
            "explode",
            "damage",
            "engine",
            "bomb"
        ],
        "url": "./sounds",
        "file_type": ".mp3"
    }
}
if (typeof window === "undefined"){
    module.exports = FILE_DATA;
}