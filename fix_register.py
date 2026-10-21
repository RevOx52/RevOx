from pathlib import Path
import re
import shutil
from datetime import datetime

path = Path("server/routes/auth.js")
source = path.read_text()

# Ищем INSERT пользователя и ближайший токен регистрации.
insert = source.find("INSERT INTO users")
if insert == -1:
    raise SystemExit("ОШИБКА: INSERT INTO users не найден. Файл не изменён.")

start = source.rfind("await database.run(`", 0, insert)
if start == -1:
    raise SystemExit("ОШИБКА: начало INSERT не найдено. Файл не изменён.")

token_start = source.find("const token", insert)
if token_start == -1:
    raise SystemExit("ОШИБКА: токен регистрации не найден. Файл не изменён.")

response_start = source.find("res.json({", token_start)
if response_start == -1:
    raise SystemExit("ОШИБКА: ответ регистрации не найден. Файл не изменён.")

response_end = source.find("});", response_start)
if response_end == -1:
    raise SystemExit("ОШИБКА: конец ответа регистрации не найден. Файл не изменён.")

response_end += 3

# Не меняем код, если найденный блок не похож на ожидаемый.
old_block = source[start:response_end]
if "jwt.sign" not in old_block or "token" not in old_block:
    raise SystemExit("ОШИБКА: участок не прошёл проверку. Файл не изменён.")

backup = path.with_name(
    f"auth.js.backup-register-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
)
shutil.copy2(path, backup)

replacement = r"""await database.run(`
    INSERT INTO users
    (
        email, username, first_name, last_name,
        avatar, password, created_at
    )
    VALUES
    (
        '${email}',
        '${username}',
        '${firstName}',
        '${lastName}',
        '${avatar || ""}',
        '${hash}',
        '${new Date().toISOString()}'
    )
`);

const registeredUsers = await database.query(`
    SELECT id, email
    FROM users
    WHERE email = '${email}'
    LIMIT 1
`);

if (!registeredUsers.length) {
    throw new Error("Registered user was not found");
}

const token = jwt.sign(
    {
        id: registeredUsers[0].id,
        email: registeredUsers[0].email
    },
    process.env.JWT_SECRET,
    { expiresIn: "5y" }
);

res.json({
    success: true,
    token
});"""

path.write_text(source[:start] + replacement + source[response_end:])
print(f"Регистрация обновлена. Резервная копия: {backup}")
