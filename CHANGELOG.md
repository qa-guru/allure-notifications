# Changelog

## v 2.0.1

### English
- Updated [README.md](README.md) to use the new command line parsing library
- Added message templates (_ru/en_)
- Added support for English
- Added contract of bots (_AllureBot_)
- Added BaseClient for sending messages (_by default in telegram_)
- Added TelegramClient to encapsulate the logic for sending messages via TelegramBot
- Refactoring of the PieChartBuilder class
- Removed PieChartBot and TextBot
- Added Attachment class, encapsulating photo and text creation for sending via bot

### Russian
- Обновлён [README.md](README.md) под использование новой библиотеки парсинга командной строки
- Добавлены темплейты сообщений (_ru/en_)
- Добавлена поддержка английского языка
- Добавлен контракт ботов AllureBot
- Добавлен BaseClient для отправки сообщений (_по умолчанию в telegram_)
- Добавлен TelegramClient для инкапсулирования логики по отправке сообщений через TelegramBot
- Произведён рефакторинг класса PieChartBuilder
- Удалены PieChartBot и TextBot
- Добавлен класс Attachment, инкапсулирующий создание фото и текста для отправки через бота

## v 2.0.2

### English

- Fixed bug with passing parameters by keys `-l` and `-e`
- Added Template contract for template development
- Added TemplateData class to store information for reports
- Added RuTemplate and EngTemplate classes that implement the new contract
- Added a Telegram class that implements the generation of a formatted message
- Added a method for generating TemplateData in the Utils class
- TemplateFactory class now returns formatted message
- Implemented workflow for publishing releases with new assemblies to GitHub 

### Russian

- Исправлена ошибка с передачей параметров по ключам `-l` и `-e`
- Добавлен контракт Template для разработки шаблонов
- Добавлен класс TemplateData для хранения информации для отчетов
- Добавлены классы RuTemplate и EngTemplate, реализующие новый контракт
- Добавлен класс Telegram, реализующий генерацию отформатированного сообщения
- Добавлен метод по генерации TemplateData в классе Utils
- Класс TemplateFactory теперь возвращает отформатированное сообщение
- Реализован workflow для публикации релизов с новыми сборками в GitHub