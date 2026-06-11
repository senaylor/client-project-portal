<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organisation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['organisation_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
