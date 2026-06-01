using MongoDB.Driver;
using WebApplication1.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Add services to the container.
var mongosettings = builder.Configuration.GetSection("ConnectionStrings");
builder.Services.AddSingleton<IMongoClient>(new MongoClient(mongosettings["DefaultConnection"]));
builder.Services.AddScoped(sp =>
{
    var client = sp.GetRequiredService<IMongoClient>();
    return client.GetDatabase(mongosettings["DatabaseName"]);
});
builder.Services.AddScoped<MovieService>();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}
app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowReact");

app.UseAuthorization();

app.MapControllers();

app.Run();
