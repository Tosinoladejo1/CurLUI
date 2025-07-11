﻿// <auto-generated />
using System;
using ApiIntegrationUtility.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace ApiIntegrationUtility.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "9.0.6");

            modelBuilder.Entity("ApiIntegrationUtility.Models.Integration", b =>
                {
                    b.Property<Guid>("IntegrationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("IntegrationId");

                    b.ToTable("Integrations");
                });

            modelBuilder.Entity("ApiIntegrationUtility.Models.RequestItem", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Body")
                        .HasColumnType("TEXT");

                    b.Property<string>("HeadersJson")
                        .HasColumnType("TEXT");

                    b.Property<Guid>("IntegrationId")
                        .HasColumnType("TEXT");

                    b.Property<string>("Method")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("PlaceholderSource")
                        .HasColumnType("TEXT");

                    b.Property<string>("Url")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<bool>("UseBearerToken")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("IntegrationId");

                    b.ToTable("RequestItems");
                });

            modelBuilder.Entity("ApiIntegrationUtility.Models.RequestItem", b =>
                {
                    b.HasOne("ApiIntegrationUtility.Models.Integration", "Integration")
                        .WithMany("Requests")
                        .HasForeignKey("IntegrationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Integration");
                });

            modelBuilder.Entity("ApiIntegrationUtility.Models.Integration", b =>
                {
                    b.Navigation("Requests");
                });
#pragma warning restore 612, 618
        }
    }
}
