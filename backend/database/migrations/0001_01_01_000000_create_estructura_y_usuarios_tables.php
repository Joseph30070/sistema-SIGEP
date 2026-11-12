<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Departamentos (Áreas estratégicas de la empresa)
        Schema::create('departamentos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('codigo')->unique();
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->timestamps();
        });

        // 2. Cargos / Puestos de Trabajo
        Schema::create('cargos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('departamento_id')->constrained('departamentos')->onDelete('cascade');
            $table->enum('nivel_jerarquico', ['directivo', 'supervision', 'operativo', 'practicas'])->default('operativo');
            $table->decimal('salario_base', 10, 2)->nullable();
            $table->text('descripcion')->nullable();
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->timestamps();
        });

        // 3. Tabla usuarios (reemplaza 'users' con 100% de atributos en español)
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('rol', ['administrador', 'supervisor', 'colaborador', 'practicante'])->default('colaborador');
            $table->string('telefono')->nullable();
            $table->string('dni')->nullable();
            $table->foreignId('departamento_id')->nullable()->constrained('departamentos')->nullOnDelete();
            $table->foreignId('cargo_id')->nullable()->constrained('cargos')->nullOnDelete();
            $table->enum('estado', ['activo', 'inactivo'])->default('activo');
            $table->string('foto_perfil')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        // Vincular responsable a departamentos
        Schema::table('departamentos', function (Blueprint $table) {
            $table->foreignId('responsable_id')->nullable()->after('descripcion')->constrained('usuarios')->nullOnDelete();
        });

        // Tokens para restablecimiento de contraseñas
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Sesiones del sistema
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        
        Schema::table('departamentos', function (Blueprint $table) {
            $table->dropForeign(['responsable_id']);
            $table->dropColumn('responsable_id');
        });
        
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('cargos');
        Schema::dropIfExists('departamentos');
    }
};

