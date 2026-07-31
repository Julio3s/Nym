# Generated manually: ajout du champ type (revenu/depense)
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('expenses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='expense',
            name='type',
            field=models.CharField(
                choices=[('depense', 'Dépense'), ('revenu', 'Revenu')],
                default='depense',
                max_length=10,
                verbose_name='Type',
            ),
        ),
    ]